'use strict';
const uuid = require('uuid');
const extend = require('gextend');

class Service {
    constructor(...options) {
        this.init(...options);
    }

    init(...options) {
        extend(this, ...options);

        if (!this.id) {
            this.id = uuid.v4();
        }

        this.createdAt = new Date();
    }

    setData(data={}) {
        this.data = data;

        if (data.id) {
            this.id = data.id;
        }
    }

    serialize() {
        return JSON.stringify({
            id: this.id,
            createdAt: this.createdAt
        });
    }

    deserialize() {
        return this.data;
    }

    get primaryKey() {
        return `${this.primaryKeySuffix}:${this.id}`;
    }

    get servicesKey() {
        return this.servicesKeySuffix;
    }

    get currentOutageKey() {
        return `${this.id}:${this.currentOutageKeySuffix}`;
    }

    get outagesKey() {
        return `${this.id}:${this.outagesKeySuffix}`;
    }

    get latencyKey() {
        return `${this.id}:${this.latencyKeySuffix}`;
    }

    get failureKey() {
        return `${this.id}:${this.failureCountKeySuffx}`;
    }
}

module.exports = Service;