'use strict';

module.exports = {
    url: process.env.NODE_MQTT_ENDPOINT || 'mqtt://localhost:1883',
    onconnect: {
        topic: 'co/${app.name}/service/up'
    },
    transport: {
        keepalive: 60,
        reschedulePings: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
        // username:,
        // password:,
        will: {
            topic: 'co/${app.name}/service/down'
        }
    },
    options: {
        qos: 0,
        retain: false
    }
};