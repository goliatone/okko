'use strict';
const extend = require('gextend');


const defaults = {
    runs: 0,
    reschedule: true,
};

/** 
 * 
 * @param {Object} options Config options
 * @param {Date}   options.expire Date to expire at
 * @param {Number} options.expire Timestamp to expire at
 * @param {Object} options.data  Object with task data
 * 
 */
class Task {

    constructor(options) {
        this.init(options);
    }

    init(options = {}) {
        extend(this, defaults, options);
    }

    fromJSON(data) {
        extend(this, data);
    }

    toJSON() {
        return {
            id: this.id,
            key: this.key,
            data: this.data,
            //We should make sure this does not grow
            //above a given number?
            runs: this.runs,
            repeat: this.repeat,
            expire: this.expire,
            pattern: this.pattern,
            reschedule: this.reschedule
        };
    }
    serialize() {
        let out = this.toJSON();
        return JSON.stringify(out);
    }

    deserialize(data) {
        let json = JSON.parse(data);
        this.fromJSON(json);
    }

    createIfNew() {
        return new Promise((resolve, reject) => {
            
            const _responder = (err, res) => {
                if(err) reject(err);
                else resolve(this);
            };

            const {key, id, client, ttl} = this;
            
            const ttlKey = `${key}:ttl`;

            //We should check if both exist.
            client.exists(ttlKey, (err, exists) => {
                if (err) return reject(err);
                if(exists) {
                    console.log('† SET TTL %s %s\n', ttlKey, ttl);
                    this.exists = exists;
                    client.pexpire(ttlKey, ttl, _responder);
                } else {
                    console.log('+ SET TTL %s %s \n', ttlKey, ttl);
                    client.multi()
                        .set(key, this.serialize())
                        .set(ttlKey, key, 'PX', ttl)
                        .exec(_responder);
                }
            });
        });
    }

    set id(value) {
        this._id = value;
        this.key = `scheduler:tasks:${value}`;
    }

    get id() {
        return this._id;
    }

    set ttl(value) {
        this.expire = value;
    }

    get ttl( ) {
        if(this.expire instanceof Date) {
            this.expire = this.expire.getTime() - Date.now();
        }

        return this.expire;
    }
}

module.exports = Task;