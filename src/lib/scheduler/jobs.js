'use strict';

const extend = require('gextend');
const Task = require('./task');
const serviceFactory = require('./factory');
const MonitorService = require('../status-monitor/service');    


const client = serviceFactory({
    host: '192.168.99.100'
});

const pubsub = serviceFactory({
    host: '192.168.99.100'
});

let monitor = new MonitorService({
    persistenceOptions: {
        host: '192.168.99.100'
    }
});

init();

function init() {
    console.log('initialize service...');
    // createMonitorService();
    subscribeToKeyEvents();
    loadAllServices();
}

/** 
 * We register redis event listeners for
 * expired keys and updates to any 
 * waterline:service
*/
function subscribeToKeyEvents() {
    console.log('Subscribe to key events...');

    //TODO: Can we listen for _keyevent:0__:scheduler:task:*
    pubsub.subscribe(`__keyevent@0__:expired`);
    pubsub.psubscribe('__key*__:waterline:service:id:*');

    pubsub.on('message', onTaskExpired);
    pubsub.on('pmessage', onServiceKeyUpdate);
}

function loadAllServices() {
    console.log('Loading all services...');

    client.keys('waterline:service:id:*', (err, result = []) => {
        console.log('Services loaded: total %s', result.length);
        console.log(result);

        hidrateTasksFromAllServices(result);
    });
}

/**
 * Redis pub/sub handler. This get's fired
 * every time a scheduler:task TTL expires.
 * - We then retrieve the task
 * - pass it to our service monitor to run 
 * a probe
 * - save the task and update TTL
 * 
 * TODO: We should get the TTL from the
 * service monitor, it should compute the
 * value based on the result. We could have
 * a regular TTL if OK, and might want to try
 * again in a shorter period if KO.
 * 
 * @param {String} channel String
 * @param {String} message String
 */
function onTaskExpired(channel, message) {
    let taskId = _getTaskId(message);

    if (!taskId) {
        return console.log('ignore', message);
    }

    console.log('Task expired!');
    console.log('Retriving task %s', taskId);

    client.get(taskId, async (err, serializedTask) => {
        let task = new Task();
        task.deserialize(serializedTask);
        
        try {
            await monitor.probe(task.data);
        } catch (error) {
            console.log('ERROR executing task');
            console.error(error.message);
            console.log();
        }

        task.runs++;

        console.log('√ SET TTL', `${task.key}:ttl`, task.key, task.runs);

        /*
         * After we execute our command we 
         * save our task so that we can keep 
         * track of it. 
         */
        client
            .multi()
            .set(task.key, task.serialize())
            .set(`${task.key}:ttl`, task.key, 'PX', task.ttl)
            .exec((err, res) => {
                if (err) console.error('ERROR', err);
                else console.log('task rescheduled: OK');
            });
    });
}

/**
 * Triggered by redis key events. 
 * We relate waterline:service:id to scheduler:task:id
 * If we updated our waterline service, we update our
 * corresponding task. If we created a new service
 * we create a new task.
 * 
 * @param {String} channel 
 * @param {String} message 
 */
function onServiceKeyUpdate(channel, message) {
    console.info('-------');
    console.info('pmessage: channel "%s" message: "%s"', channel, message);

    const id = _getIdFromMessage(message);
    taskFromService(id);
}

function taskFromService(taskId) {

    return new Promise((resolve, reject) => {

        client.get(taskId, async (err, service) => {
            if (err) return reject(err);
            if(!service) return resolve({found: false, id: taskId});

            service = JSON.parse(service);
            
            console.log(service.id);
    
            /**
             * We are matching a service ID
             * to a task ID. And the data we
             * store in our task is the actual
             * Service. So there's pretty much
             * a one to one relationship.
             */
            let task = new Task({
                client,
                data: service,
                id: service.id,
                ttl: service.interval
            });
    
            try {
                await task.createIfNew();
            } catch (error) {
                return reject(error);
            }
            
            if(task.exists) {
                monitor.persistence.serviceUpdate(service);
            } else {
                monitor.persistence.serviceCreate(service);
            }

            resolve(task);
        });
    });
}

/**
 * Every time we start up our watcher-service we
 * should load previous tasks. 
 * We do so from
 * waterline:service:id:<id>
 * 
 * If the service does not have a related
 * scheduler:task:<id>
 * we create it.
 * 
 * @param {Array} services List of services
 */
function hidrateTasksFromAllServices(services = []) {
    console.log('Hidrating tasks from services...');

    services.map(waterlineService => {
        //We should be able to get a task id from a waterline record:
        // waterline:service:id:<id> => scheduler:tasks:<id>
        let taskId = _makeTaskIdFromRecord(waterlineService);
        console.log('make task id from record: %s', waterlineService);
        console.log('Looking for task with id "%s"', taskId);
        console.log('---');

        /**
         * Retrieve our serialized task for the service id:
         * scheduler:tasks:6
         */
        client.get(taskId, async (err, serialized) => {
            if (err) return console.error('Error getting task:', err);

            /**
             * We don't have a task for the service.
             * Create one.
             */
            if (!serialized) {
                console.log('The service "%s" does not have a task. Create it', id);
                //waterlineService: waterline:service:id:6
                return client.get(waterlineService, async (err, service) => {
                    if (err){
                        return console.error('Error retriving service info.', err);
                    }
                        
                    service = JSON.parse(service);
                    // let {data} = record.data;
                    console.log('======')
                    console.log('Service ID:', service.id);
                    console.log(service);
                    console.log('-----\n');

                    let task = new Task({
                        client,
                        data: service,
                        id: service.id,
                        ttl: service.interval
                    });

                    try {
                        await task.createIfNew();
                    } catch (error) {
                        console.log('ERROR', error);
                    }

                    if(task.exists) {
                        service = await monitor.persistence.serviceUpdate(service);
                    } else {
                        service = await monitor.persistence.serviceCreate(service);
                    }
                    console.log('created service');
                    console.log(service);
                });
            }

            /**
             * This service already had a task.
             * Bring it back up and start running
             * the task.
             */
            console.log('The service has a task. Launch it');

            let service = JSON.parse(serialized);
            console.log('Task %s: %s\n', service.id, service.key);
            console.log('======')
            console.log('Service ID:', service.id);
            console.log(service);
            console.log('-----\n');

            let task = new Task({ client });
            task.deserialize(serialized);

            try {
                await task.createIfNew();
            } catch (error) {
                console.log('ERROR', error);
            }

            if(task.exists) {
                monitor.persistence.serviceUpdate(service);
            } else {
                monitor.persistence.serviceCreate(service);
            }
        });
    });
}

function _getIdFromMessage(message) {
    return message.replace('__keyspace@0__:', '');
}

function _getTaskId(message) {
    let match = message.match(/^(scheduler:tasks:.+):ttl$/);
    if (!match) return false;
    return match[1];
}

function _makeTaskIdFromRecord(message) {
    let match = message.match(/^waterline:service:id:(.+)$/);
    let id = match[1];
    return `scheduler:tasks:${id}`;
}

/////////////////////////////////////////////
const request = require('request-promise');
class Command extends Task {
    execute() {
        let record = this.data;
        console.log('-------- record --------');
        console.log(record);

        let health = record.endpoint;
        console.log(health);
        return request({
            uri: `${health}?count=${this.runs}`,
            resolveWithFullResponse: true,
            simple: false
        });
    }
}
