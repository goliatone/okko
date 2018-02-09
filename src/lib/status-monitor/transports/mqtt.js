'use strict';
const mqtt = require('mqtt');
const extend = require('gextend');
const BaseMonitor = require('./base');

const defaults = {
    testPattern: /mqtts?/
};

/** 
 * MQTT Monitor: This monitors services that
 * expose an MQTT or MQTTS endpoint.
 * 
 * MQTT spec allows clients to check if a 
 * broker is up by sending a PINGREQ command.
 * 
 * If we intend to test a client and not a broker
 * we need a local implementation, our clients
 * should implement a protocol that honors a
 * ping-pong flow. 
 */
class MqttMonitor extends BaseMonitor {

    probe(data) {
        extend(this, defaults, data);

        let endpoint = this.endpoint;
        
        let client = mqtt(endpoint);

        this.start();

        return client({
            uri: `${endpoint}`,
            /**
             * This makes 404 an OK
             */
            resolveWithFullResponse: true,
            simple: false
        })
        .then(response => {
            this.success = true;
        })
        .catch(err => {
            this.success = false;
            this.message = err.message;
        })
        .finally(_ => {
            this.stop();
        });
    }

    getOptionsMetadata() {
        return {
            isClient: {
                description: 'Broker handle ping request. Clients need custom flow (defaults to false)',
                required: false,
                value: false
            },
            respondToTopic: {
                description: 'Topic to which a client responds to notify is up (defaults to health/ping)',
                required: false,
                value: 'health/ping'
            },
            respondToResponse: {
                description: 'Expected response to respondTo topic (defaults to pong)',
                required: false,
                value: 'pong'
            }
        };
    }
}

/**
 * We need to attach defaults to the 
 * constructor if we want parent to 
 * extend instances with default values.
 */
MqttMonitor.defaults = defaults;

module.exports = MqttMonitor;
// let m = new MqttMonitor();
// m.check({endpoint:'http://localhost:9876/api/health'}).then(()=>console.log(m.result()))