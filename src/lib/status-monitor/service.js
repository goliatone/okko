'use strict';
const extend = require('gextend');
const getPackage = require('read-pkg-up');

const EventEmitter = require('events');

const defaults = {
    shouldLoadMonitors: true,
    shouldLoadExtensions: true,
    packageTransportPrefix: 'okko-monitor',
    packageExtensionPrefix: 'okko-extension',
    defaultMonitors: [
        './transports/http'
    ],
    defaultExtensions: [
        './extensions/events-console'
    ],
    persistenceOptions: {
        host: 'localhost'
    },
    persistenceFactory: function(config) {
        console.log('persitenceFactory', config);
        let Persistence = require('./persistence/redis');
        return new Persistence(config);
    }
};

class StatusMonitorService extends EventEmitter {
    constructor(options) {
        super();
        this.init(options);
    }

    init(options = {}) {
        this.transports = [];

        extend(this, defaults, options);

        this.initializePersistence();

        this.defaultMonitors.map(filepath => {
            this.loadTransportMonitor(filepath);
        });

        this.defaultExtensions.map(filepath => {
            this.loadServiceExtension(filepath);
        });

        if (this.shouldLoadMonitors) {
            this.loadPluginTransportMonitors();
        }

        if (this.shouldLoadExtensions) {
            this.loadPluginServiceExtensions();
        }
    }

    async probe(service) {
        let monitor = this.findServiceMonitor(service);

        try {
            await monitor.probe(service);
        } catch (error) {}

        let probe = monitor.valueObject();
        console.log('---------------');
        console.log('service', service.id);
        console.log(probe);
        console.log('---------------');

        return this.addResult(service, probe);
    }

    async addResult(service, probe) {
        //TODO: we could support a failure interval and a regular interval.

        const persistence = this.persistence;

        /*
         * OK! check went butter smooth...
         */
        if (probe.success) {
            console.log('success');

            await persistence.resetOutageFailureCount(service);

            /**
             * ...well, maybe not sooo smoooth.
             * We might be slow!
             */
            const limit = service.latencyLimit;

            if (limit && probe.elapsedTime > limit) {

                this.emit('monitor.latency.warning', {
                    service,
                    probe
                });
            }

            await persistence.saveLatency(service, probe).then(_ => console.log('saveLatency!'));

            const currentOutage = await persistence.archiveCurrentOutageIfExists(service);

            const event = {
                service,
                probe,
                currentOutage
            };

            if (currentOutage) {
                this.emit('monitor.service.back', event);
            }

            this.emit('monitor.service.ok', event);
            /*
             * KO! check went but...
             */
        } else {
            const currentFailureCount = await persistence.increaseFailureCount(service);

            this.emit('monitor.service.ko', {
                service,
                probe,
                currentFailureCount
            });

            let outage = await persistence.getCurrentOutage(service);

            if (outage) {
                /**
                 * This service was already down...
                 */
                this.emit('monitor.outage.current', {
                    service,
                    probe,
                    outage
                });

            } else {
                let { errorAlterThreshold = 1 } = service;

                if (currentFailureCount >= errorAlterThreshold) {
                    outage = {
                        timestamp: probe.startTime,
                        error: probe.message
                    };

                    await persistence.startOutage(service, outage);

                    this.emit('monitor.outage.new', {
                        service,
                        probe,
                        outage
                    });
                }
            }
        }
    }

    findServiceMonitor(service) {
        return this.transports.find(transport => {
            return transport.shouldMonitor(service);
        });
    }

    /**
     * Load and initialize a transport monitor.
     *
     * @param {String} filepath Path to module to load
     */
    loadTransportMonitor(filepath) {
        let TransportMonitor = require(filepath);
        this.transports.push(new TransportMonitor());
    }

    loadServiceExtension(filepath) {
        let StatusMonitorExtension = require(filepath);
        new StatusMonitorExtension(this);
    }

    /**
     * Any package we installed that matches
     * `packageTransportPrefix` will be loaded.
     * By default, any package which name starts
     * with **okko-monitor-** will be loaded, e.g.
     * **okko-monitor-mqtt**.
     */
    loadPluginTransportMonitors() {
        this.loadPlugins(this.packageTransportPrefix, this.loadTransportMonitor);
    }

    loadPluginServiceExtensions() {
        this.loadPlugins(this.packageExtensionPrefix, this.loadServiceExtension);
    }

    loadPlugins(prefix, callback) {
        let result = getPackage.sync();
        let { dependencies } = result.pkg;

        Object.keys(dependencies).map(dep => {
            if (dep.indexOf(prefix) === 0) {
                callback(dep);
            }
        });
    }

    initializePersistence() {
        if (this.persistence) return;

        let config = this.persistenceOptions;
        this.persistence = this.persistenceFactory(config);
    }
}

module.exports = StatusMonitorService;

//TEST//

// let service = new StatusMonitorService({
//     persistenceOptions: {
//         host: '192.168.99.100'
//     }
// });

// service.probe({
//     interval: 30000,
//     latencyLimit: 5000,
//     errorAlterThreshold: 1,
//     responseAlertThreshold: 1,
//     endpoint: 'http://google.com',
//     application: 'b7ce9a05-ffea-4803-a6dd-04b97d363704',
//     id: '2b17247b-57c0-43f0-9e97-caf228b1704e',
//     uuid: '7ce3b768-1b30-46d1-a524-ffbef4be6581',
//     createdAt: '2018-01-24T04:03:02.761Z',
//     updatedAt: '2018-01-24T04:03:02.761Z'
// });