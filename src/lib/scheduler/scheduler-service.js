'use strict';

const extend = require('gextend');
const EventEmitter = require('events');
const Task = require('./task');

const defaults = {
    serviceFactory: require('./factory'),
    serviceOptions: {
        host: '192.168.99.100'
    }
};

class SchedulerService extends EventEmitter {

    constructor(config) {
        this.init(config);
    }

    init(config) {

        this.expiredKeyEvents = '__keyevent@0__:expired';
        this.watchedKey = 'waterline:application:id';
        this.resourceRegex = /^waterline:application:id:(\w+)$/;
        this.triggerKeys = `${this.watchedKey}:*`;
        this.taskEvents = `__key*__:${this.watchedKey}:*`;

        extend(this, defaults, config);

        this.client = this.serviceFactory(this.serviceOptions);
        this.pubsub = this.serviceFactory(this.serviceOptions);

        this.subscribeToKeyEvents();
    }

    subscribeToKeyEvents() {

        this.pubsub.psubscribe(this.taskEvents);
        this.pubsub.subscribe(this.expiredKeyEvents);

        this.pubsub.on('pmessage', (channel, message)=>{
            this.handlePmessage(channel, message);
        });
    }

    handlePmessage(channel, message) {
        const id = this._getIdFromMessage(message);
        
        this.client.get(id, async (err, record) => {

            if(err) {  
                return console.error('error', err);
            }

            record = JSON.parse(record);

            let task = new Task({
                client: this.client,
            });
        });
    }

    loadTriggerKeys() {
        
        this.client.keys(this.triggerKeys, async (err, result=[]) => {
            
            result.map( resource => {
                
                const id = this._makeTaskIdFromResource(resource);

                this.client.get(id, async (err, serialized) => {
                    if(err){ 
                        return console.error('Error', err);
                    }

                    if(!serialized) return this.createTaskFromResource(resource);

                    const record = JSON.parse(serialized);

                    const task = new Task({client: this.client});
                    task.deserialize(serialized);

                    try {
                        await task.createIfNew();
                    } catch (error) {
                        console.error('error', error);
                    }
                });
            });
        });
    }

    createTaskFromResource(resource) {
        const id = this._getIdFromResource(resource);

        return new Promise((resolve, reject) => {

            this.client.get(resource, async (err, record) => {
                if(err) return reject(err);

                record = JSON.parse(record);

                const task = new Task({
                    client: this.client,
                    ttl: 2 * 1000,
                    data: record,
                    id: record.id
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
        const match = message.match(/^(scheduler:tasks:\w+):ttl$/);
        if(!match) return false;
        return match[1];
    }

    _getIdFromResource(resource) {
        if(typeof resource === 'object') {
            return resource.id;
        }
        return resource;
    }

    _makeTaskIdFromResource(resource) {
        const match = message.match(this.resourceRegex);
        const id = match[1];
        return `scheduler:tasks:${id}`;
    }
}