'use strict';
const extend = require('gextend');
const request = require('request-promise');

class BaseMonitor {

    constructor(config) {
        extend(this, this.constructor.defaults, config);
    }

    probe(data) {
        this.doProbe(data);
    }

    doProbe(data){
        throw new Error('Abstract method');
    }

    /** 
     * This is an instrospection method to
     * enable clients present a UI to configure
     * the monitor.
     * Each optional property that we want to 
     * expose for external configuration should 
     * define 3 attributes:
     * - description: String
     * - required: Boolean
     * - value: Any
     */
    getOptionsMetadata() {
        return {};
    }

    shouldMonitor(service) {
        let protocol = this.getProtocol(service);
        return this.testPattern.test(protocol);
    }

    start() {
        this.startTime = Date.now();
    }

    stop() {
        this.endTime = Date.now();
        this.elapsedTime = this.endTime - this.startTime;
    }

    valueObject() {
        return {
            success: this.success,
            message: this.message,
            startTime: this.startTime,
            elapsedTime: this.elapsedTime
        };
    }

    getProtocol(service) {
        let {endpoint} = service;
        return endpoint.split('://')[0];
    }
}

/**
 * We need to attach defaults to the 
 * constructor if we want parent to 
 * extend instances with default values.
 */
BaseMonitor.defaults = {};

module.exports = BaseMonitor;
