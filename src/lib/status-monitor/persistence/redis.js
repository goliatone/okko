'use strict';
const uuid = require('uuid');
const extend = require('gextend');

const Service = require('./Service');

const defaults = {
    keySuffix: {
        primaryKeySuffix: 'service',
        servicesKeySuffix: 'service',
        latencyKeySuffix: 'latency',
        currentOutageKeySuffix: 'outage:current',
        outagesKeySuffix: 'outage',
        failureCountKeySuffx: 'failure:count'
    },
    analytics: require('../analytics'),
    parseLatencyDataFromZset: function(zset) {
        const list = [];
        let currentObj,
            accLatency = 0;

        for (let i = 0; i < zset.length; i++) {
            if (i % 2 === 0) {
                let lat = zset[i];
                if (lat.indexOf(':') !== -1) {
                    lat = lat.split(':')[1];
                }
                currentObj = { l: parseFloat(lat) };
                if (!isNaN(lat) && lat > 0) {
                    accLatency += parseFloat(lat);
                }
            } else {
                currentObj.t = parseFloat(zset[i]);
                list.push(currentObj);
            }
        }

        return {
            list,
            mean: Math.round(accLatency / list.length)
        };
    }
};

class RedisPersistence {
    constructor(config) {
        this.init(config);
    }

    init(config) {
        extend(this, defaults, config);

        if (!this.client) {
            this.client = this.createRedisClient(config);
        }
    }

    serviceCreate(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(this.keySuffix);
            service.setData(data);

            const multi = this.client.multi();

            multi.set(service.primaryKey, service.serialize());
            multi.sadd(service.servicesKey, service.id);
            multi.exec(err => {
                if (err) reject(err);
                else resolve(service);
            });
        });
    }

    serviceUpdate(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(this.keySuffix);
            service.setData(data);

            const multi = this.client.multi();

            multi.set(service.primaryKey, service.serialize());

            multi.exec(err => {
                if (err) return reject(err);
                this.serviceFindOne(service)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    serviceFindOne(data) {
        if (typeof data === 'string') {
            data = { id: data };
        }

        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);
            console.log('service.primaryKey', service.primaryKey);
            this.client.get(service.primaryKey, (err, result) => {
                if (err) return reject(err);
                if(!result) return resolve();
                console.log('result raw', result);
                service.setData(result);
                resolve(service.deserialize());
            });
        });
    }

    serviceFindAll() {
        return new Promise((resolve, reject) => {
            let service = new Service(this.keySuffix);

            this.client.smembers(service.servicesKey, (err, ids) => {
                if (err) return reject(err);
                const multi = this.client.multi();
                ids.map(id => {
                    service.setData({ id });
                    multi.get(service.primaryKey);
                });

                multi.exec((err, services) => {
                    if (err) return reject(err);
                    resolve(services.map(i => JSON.parse(i)));
                });
            });
        });
    }

    serviceDelete(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);

            const multi = this.client.multi();

            multi.del(service.primaryKey);
            multi.srem(service.servicesKey, service.id);

            /*
             * Remove service from all reporting 
             * data.
             */
            multi.del(service.outagesKey);
            multi.del(service.latencyKey);
            multi.del(service.failureKey);
            multi.del(service.currentOutageKey);

            multi.exec((err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    serviceReset(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);

            const multi = this.client.multi();

            /*
             * Remove service from all reporting 
             * data.
             */
            multi.del(service.outagesKey);
            multi.del(service.latencyKey);
            multi.del(service.failureKey);
            multi.del(service.currentOutageKey);

            multi.exec((err, res) => {
                if (err) reject(err);
                else resolve(res);
            });
        });
    }

    resetOutageFailureCount(data) {
        let service = new Service(data, this.keySuffix);

        return new Promise((resolve, reject) => {
            this.client.del(service.failureKey, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    saveLatency(data, probe) {
        let service = new Service(data, this.keySuffix);

        const timestamp = probe.startTime;
        const range = timestamp + ':' + probe.elapsedTime;
        return new Promise((resolve, reject) => {
            this.client.zadd(service.latencyKey, timestamp, range, err => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /**
     * 
     * @param {Object} data 
     * @param {String} data.id Service id
     * @param {Number} [timestamp=-inf] Start point for our query
     * @param {Boolean} aggregatedBy If false we skeep aggregation
     * @param {String} aggregatedBy Aggregation units: second, minute
     *                              hour, day, week, month, quarter, year
     */
    getLatencySince(data, timestamp = '-inf', aggregatedBy = false) {
        let service = new Service(data, this.keySuffix);

        return new Promise((resolve, reject) => {
            this.client.zrevrangebyscore( service.latencyKey, '+inf', timestamp, 'withscores', (err, data) => {
                    if (err) return reject(err);

                    if (!data.length) {
                        if (aggregatedBy) {
                            return resolve({ list: [], mean: 0 });
                        }

                        return resolve([]);
                    }
                    const parsedData = this.parseLatencyDataFromZset(data);
                    if (aggregatedBy) {
                        console.log('')
                        this.analytics.aggregate(parsedData.list, aggregatedBy, aggregatedData => {
                            resolve({
                                list: aggregatedData,
                                mean: parsedData.mean
                            });
                        });
                    } else {
                        resolve(parsedData);
                    }
                }
            );
        });
    }

    archiveCurrentOutageIfExists(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);

            this.getCurrentOutage(service).then(outage => {
                if (outage) {
                    outage.downtime = Date.now() - outage.timestamp;

                    const multi = this.client.multi();
                    
                    multi.del(service.currentOutageKey);

                    multi.zadd(
                        service.outagesKey,
                        outage.timestamp,
                        JSON.stringify(outage)
                    );

                    multi.exec(err => {
                        if (err) reject(err);
                        else resolve();
                    });
                } else resolve();
            });
        });
    }

    getServiceOutagesSince(data, timestamp) {
        let service = new Service(data, this.keySuffix);
        // service.setData(data);

        return new Promise((resolve, reject) => {
            this.client.zrevrangebyscore(
                service.outagesKey,
                '+inf',
                timestamp,
                (err, data) => {
                    if (err) return reject(err);
                    resolve(data.map(entry => JSON.parse(entry)));
                }
            );
        });
    }

    increaseFailureCount(data) {
        let service = new Service(data, this.keySuffix);
        // service.setData(data);

        return new Promise((resolve, reject) => {
            this.client.incr(service.failureKey, (err, counter) => {
                if (err) reject(err);
                else resolve(counter);
            });
        });
    }

    getCurrentOutage(data) {
        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);
            // service.setData(data);

            this.client.get(service.currentOutageKey, (err, result) => {
                if (err) return reject(err);
                resolve(JSON.parse(result));
            });
        });
    }

    startOutage(data, outage) {
        return new Promise((resolve, reject) => {
            let service = new Service(data, this.keySuffix);
            // service.setData(data);

            if (!outage.timestamp) {
                outage.timestamp = Date.now();
            }

            outage = JSON.stringify(outage);

            this.client.set(service.currentOutageKey, outage, (err, result) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    flushDatabase() {
        return new Promise((resolve, reject) => {
            this.client.flushdb((err, reply) => {
                if (err) reject(err);
                else resolve(reply);
            });
        });
    }

    close() {
        this.client.quit();
    }

    createRedisClient(options = {}) {
        const redis = require('redis');
        let client;

        let {
            db = 0,
            port = 6379,
            host = 'localhost',
            path,
            password,
            redisOptions
        } = options;

        if (path) {
            client = redis.createClient(path, redisOptions);
        } else {
            console.log('=> createClient', host, port);
            client = redis.createClient(port, host, redisOptions);
        }

        if (password) {
            client.auth(password);
        }

        if (db) {
            client.select(db);
        }

        return client;
    }
}

module.exports = RedisPersistence;

// let p = new RedisPersistence({
//     host: '192.168.99.100'
// });

// p.serviceFindAll().then(console.log).catch(console.error)

// p.getLatencySince({
//     id: 'ee9dfd64-d5f8-433e-80b3-5630a1d47476',
// }, '-inf', 'hour').then(console.log).catch(console.error);

// p.getLatency({
//     id: 'ee9dfd64-d5f8-433e-80b3-5630a1d47476',
// }).then((d)=>console.log(d.list.length));
