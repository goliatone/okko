'use strict';

const MonitorService = require('./status-monitor/service');
const SchedulerService = require('./scheduler/service');

const serverIP = process.env.NODE_REDIS_IP || '192.168.99.100';

let monitor = new MonitorService({
    persistenceOptions: {
        host: serverIP
    }
});

let scheduler = new SchedulerService({
    serviceOptions: {
        host: serverIP
    }
});

scheduler.on('scheduler:task:created', ({ task }) => {
    console.log('scheduler task created', task.id);
    console.log(task.data);
    console.log('====\n');

    if (task.exists) {
        monitor.persistence.serviceUpdate(task.data);
    } else {
        monitor.persistence.serviceCreate(task.data);
    }
});

scheduler.on('scheduler:task:execute', async({ task }) => {
    console.log('scheduler task execute', task.id);
    console.log(task.data);
    console.log('====\n');

    try {
        await monitor.probe(task.data);
    } catch (error) {
        console.error('ERROR: Executing task %s', task.id);
        console.error(error.message);
        console.error(error);
        console.log();
    }
    /**
     * We commit out task.
     * Here we have the chance to update the TTL
     * for this task, in case the probe failed and
     * we might want to do some sort of TTL engineering.
     */
    task.commit();
});