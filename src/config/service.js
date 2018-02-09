'use strict';

module.exports = {
    defaults: {
        /**
         * Time in milliseconds in between
         * each probe to a service's endpoint.
         */
        interval: 30 * 1000,

        /**
         * If the elapsed time of a request
         * is greater than latency limit then
         * we generate a warning.
         * Use with responseAlertThreshold to
         * send notifiactions.
         * Time in milliseconds.
         */
        latencyLimit: 5 * 1000,

        /**
         * How many consecutive errors before
         * sending an alert?
         */
        errorAlterThreshold: 1,

        responseAlertThreshold: 1,

        active: true,

        timeoutAfter: 30 * 1000,
        
    }
};