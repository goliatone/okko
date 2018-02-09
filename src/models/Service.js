'use strict';

const BaseModel = require('core.io-persistence').BaseModel;

let schema = {
    identity: 'service',
    exportName: 'Service',
    connection: 'development',
    attributues: {
        
        label: 'string',
        description: 'string',

        /**
         * This is the endpoint we use to 
         * probe the service. It should include
         * the transport, e.g:
         * http://<domain>
         * mqtt://<d    omain>
         */
        endpoint: {
            type: 'string',
            unique: true,
            // required: true
        },

        /**
         * 
         */
        probeType: {
            type: 'string'
        },

        /**
         * Time in milliseconds in between
         * each probe to a service's endpoint.
         */
        interval: 'integer',

        /**
         * We can pause services.
         */
        active: {
            type: 'boolean', 
            defaultsTo: true
        },

        /**
         * If a probe is taking longer
         * than timeoutAfter then we
         * consider the probe failed.
         */
        timeoutAfter: {
            type: 'integer',
            defaultsTo: 30 * 1000
        },

        /**
         * If the elapsed time of a request
         * is greater than latency limit then
         * we generate a warning.
         * Use with responseAlertThreshold to
         * send notifiactions.
         * Time in milliseconds.
         */
        latencyLimit: {
            type: 'integer',
            defaultsTo: 5 * 1000
        },
        
        /**
         * How many consecutive errors before
         * sending an alert?
         */
        errorAlterThreshold: {
            type: 'integer',
            defaultsTo: 1
        },

        responseAlertThreshold: {
            type: 'integer',
            defaultsTo: 1
        },

        probeCount: {
            type: 'integer',
            defaultsTo: 0
        },

        notResponsiveCount: {
            type: 'integer',
            defaultsTo: 0
        },

        /**
         * Set of options for this service.
         */
        options: {
            type: 'json'
        },

        /**
         * Store a reference to the 
         * source Application
         */
        application: {
            model: 'application'
        }
    }
};

let Model = BaseModel.extend(schema);

module.exports = Model;

module.exports.schema = schema;