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

function subscribeToKeyEvents() {
    console.log('Subscribe to key events...');

    pubsub.subscribe(`__keyevent@0__:expired`);
    pubsub.psubscribe('__key*__:waterline:service:id:*');

    pubsub.on('message', onTaskExpired);
    pubsub.on('pmessage', onServiceCreated);
}

function loadAllServices() {
    console.log('Loading all services...');

    client.keys('waterline:service:id:*', (err, result = []) => {
        console.log('Services loaded: total %s', result.length);
        console.log(result);

        hidrateTasksFromAllServices(result);
    });
}

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
                else console.log('multi', res);
            });
    });
}

function onServiceCreated(channel, message) {
    //TODO: Ensure this only get's fired when we create a new record.
    //could it also fire on update??!!
    console.info('-------');
    console.info('pmessage: channel "%s" message: "%s"', channel, message);

    const id = _getIdFromMessage(message);
    taskFromService(id);
}

function taskFromService(taskId) {

    return new Promise((resolve, reject) => {

        client.get(taskId, async (err, service) => {
            if (err) return reject(err);
            if(!service) return resolve(false);

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

function taskFromApplication(applicationId) {

    return new Promise((resolve, reject)=>{
        client.get(applicationId, async (err, serialized) => {
            if (err) { 
                return reject(err);
            }

            if (!serialized) {
                console.log('The service "%s" does not have a task. Create it');
                return resolve(false);
            }

            console.log('The service has a task. Launch it');

            let service = JSON.parse(serialized);
            console.log('Task %s: %s', service.id, service.key);

            let task = new Task({ client });
            task.fromJSON(service);

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

            resolve(task);
        });
    });
}
 
function hidrateTasksFromAllServices(services = []) {
    console.log('Hidrating tasks from services...');

    services.map(application => {
        //We should be able to get a task id from a waterline record:
        // waterline:service:id:6 => scheduler:tasks:<id>
        let id = _makeTaskIdFromRecord(application);

        console.log('Looking for task with id "%s"', id);

        taskFromApplication(id).then((task)=>{
            if(!task) taskFromService(application);
        });

        // client.get(id, async (err, serialized) => {
        //     if (err) return console.error('Error getting task:', err);

        //     if (!serialized) {
        //         console.log('The service "%s" does not have a task. Create it');
        //         return taskFromService(application);
        //     }

        //     console.log('The service has a task. Launch it');

        //     let service = JSON.parse(serialized);
        //     console.log('Task %s: %s', service.id, service.key);

        //     let task = new Task({ client });
        //     task.fromJSON(service);

        //     try {
        //         await task.createIfNew();
        //     } catch (error) {
        //         console.log('ERROR', error);
        //     }

        //     if(task.exists) {
        //         monitor.persistence.serviceUpdate(service);
        //     } else {
        //         monitor.persistence.serviceCreate(service);
        //     }
        // });
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
