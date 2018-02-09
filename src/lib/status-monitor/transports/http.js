'use strict';
const extend = require('gextend');
const request = require('request-promise');
const BaseMonitor = require('./base');

const defaults = {
    method: 'GET',
    statusCode: 200,
    testPattern: /https?/
};

/** 
 * HTTP Monitor: This monitors services that
 * expose an HTTP or HTTPS endpoint.
 * 
 */
class HttpMonitor extends BaseMonitor {

    probe(data) {
        extend(this, defaults, data);

        let endpoint = this.endpoint;

        this.start();

        return request({
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
            statusCode: {
                description: 'Expected status code (defaults to 200)',
                required: false,
                value: 200
            },
            method: {
                description: 'HTTP method for request',
                required: false,
                value: 'GET'
            },
        };
    }
}

HttpMonitor.defaults = defaults;

module.exports = HttpMonitor;
// let m = new HttpMonitor();
// m.check({endpoint:'http://localhost:9876/api/health'}).then(()=>console.log(m.result()))