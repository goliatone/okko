'use strict';

const extend = require('gextend');
const EventEmitter = require('events');
const Task = require('./task');

const defaults = {
    serviceFactory: require('./factory'),
    serviceOptions: {
        host: 'localhost'
    }
};

class SchedulerService extends EventEmitter {

    constructor(config) {
        super();
        this.init(config);
    }

    init(config) {

        this.watchedKey = 'waterline:service:id';
        this.expiredKeyEvents = '__keyevent@0__:expired';
        this.resourceRegex = /^waterline:service:id:(\w+)$/;

        this.triggerKeys = `${this.watchedKey}:*`;
        // this.resourceRegex = new RegExp(this.watchedKey + ':\(\\w+\)');
        this.taskEvents = `__key*__:${this.watchedKey}:*`;

        extend(this, defaults, config);

        this.client = this.serviceFactory(this.serviceOptions);
        this.pubsub = this.serviceFactory(this.serviceOptions);

        this.subscribeToKeyEvents();

        this.loadAllServices();
    }

    /** 
     * Register redis event listeners for 
     * expired keys and updates on any
     * waterline:service
     * TODO: we need to ensure we have notify-keyspace-events enabled
     */
    subscribeToKeyEvents() {

        // this.pubsub.psubscribe(this.taskEvents);
        // this.pubsub.subscribe(this.expiredKeyEvents);
        this.pubsub.subscribe(`__keyevent@0__:expired`);
        this.pubsub.psubscribe('__key*__:waterline:service:id:*');

        this.pubsub.on('pmessage', (channel, message) => {
            //TODO: we could clean this up.
            this.onServiceKeyUpdate(channel, message);
        });

        this.pubsub.on('message', (channel, message) => {
            this.onTaskExpired(channel, message);
        });
    }

    /**
     * Redis pub/sub handler. 
     * This will get fired every time a key expires.
     * We filter out keys to handle only scheduler:task 
     * TTLs.
     * 
     * @param {String} channel String
     * @param {String} message String
     */
    onTaskExpired(channel, message) {
        const taskId = this._getTaskId(message);
        if (!taskId) {
            return console.log('ignoring task id', taskId);
        }

        this.client.get(taskId, (err, serializedTask) => {
            if (err) {
                return console.error('Error getting task: %s', taskId, err);
            }
            const task = new Task({
                serializedTask,
                client: this.client,
            });

            this.emit('scheduler:task:execute', { task });
        });
    }

    /**
     * Triggered by redis pattern key events.
     * We relate a waterline:service:id to 
     * scheduler:task:id.
     * If we updated our waterline service we update
     * our corresponding task.
     * If we created a new service or the service did
     * not have a task, we create it.
     * 
     * @param {String} channel Redis event channel
     * @param {String} message Redis event message
     */
    onServiceKeyUpdate(channel, message) {

        /** 
         * waterline:service:id to scheduler:task:id
         */
        const id = this._getIdFromMessage(message);

        this.taskFromService(id).then(task => {
            if (task && task.id) {
                this.emit('scheduler:task:created', { task, action: 'evented' });
            }
        });
    }

    loadAllServices() {
        // this.client.keys(this.triggerKeys, async (err, result=[]) => {
        this.client.keys('waterline:service:id:*', async(err, services = []) => {
            this.startTasksFromServices(services);
        });
    }

    startTasksFromServices(services = []) {
        services.map(waterlineService => {
            //We should be able to get a task id from a waterline record:
            // waterline:service:id:<id> => scheduler:tasks:<id>
            let taskId = this._makeTaskIdFromRecord(waterlineService);
            /**
             * Retrieve our serialized task for the service id:
             * scheduler:tasks:6
             */
            this.client.get(taskId, async(err, serializedTask) => {
                if (err) return console.error('Error getting task:', err);

                /**
                 * We don't have a task for the service.
                 * Create one.
                 */
                if (!serializedTask) {
                    console.log('The service "%s" does not have a task. Create it', id);
                    //waterlineService: waterline:service:id:6
                    return this.taskFromService(waterlineService).then(task => {
                        if (task && task.id) {
                            this.emit('scheduler:task:created', { task, action: 'created' });
                        }
                    });
                }

                /**
                 * This service already had a task.
                 * Bring it back up and start running
                 * the task.
                 */
                let task = new Task({
                    serializedTask,
                    client: this.client
                });

                try {
                    await task.createIfNew();
                } catch (error) {
                    console.log('ERROR', error);
                }

                this.emit('scheduler:task:created', { task, action: 'deserialized' });
            });
        });
    }

    //Deprecated
    taskFromService(taskId) {
        return this.createTaskFromService(taskId);
    }

    //Rename to createTaskFromRecord
    createTaskFromService(taskId) {
        return new Promise((resolve, reject) => {
            this.client.get(taskId, async(err, service) => {
                if (err) return reject(err);
                if (!service) return resolve({ found: false, id: taskId });

                service = JSON.parse(service);

                /**
                 * We are matching a service ID
                 * to a task ID. And the data we
                 * store in our task is the actual
                 * Service. So there's pretty much
                 * a one to one relationship.
                 */
                let task = new Task({
                    client: this.client,
                    data: service,
                    id: service.id,
                    ttl: service.interval
                });

                try {
                    await task.createIfNew();
                } catch (error) {
                    return reject(error);
                }

                resolve(task);
            });
        });
    }

    _getIdFromMessage(message) {
        return message.replace('__keyspace@0__:', '');
    }

    _getTaskId(message) {
        let match = message.match(/^(scheduler:tasks:.+):ttl$/);
        if (!match) return false;
        return match[1];
    }

    _makeTaskIdFromRecord(message) {
        let match = message.match(/^waterline:service:id:(.+)$/);
        let id = match[1];
        return `scheduler:tasks:${id}`;
    }
}

module.exports = SchedulerService;