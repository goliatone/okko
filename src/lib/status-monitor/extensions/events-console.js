'use strict';

class ConsoleExtension {
    constructor(monitor, config) {
        
        console.log('ConsoleExtension created...');

        monitor.on('monitor.service.back', this.onServiceBack);
        monitor.on('monitor.service.ok', this.onServiceOk);
        monitor.on('monitor.service.ko', this.onServiceKo);
        monitor.on('monitor.latency.warning', this.onLatencyWarning);
        monitor.on('monitor.outage.current', this.onOutageCurrent);
        monitor.on('monitor.outage.new', this.onOutageNew);
    }

    onServiceBack(event) {
        console.log('-------- SERVICE BACK -------');
        console.log('service:', event.service.id);
    }

    onServiceOk(event) {
        console.log('-------- SERVICE OK -------');
        console.log('service:', event.service.id);
    }

    onServiceKo(event) {
        console.log('-------- SERVICE KO! -------');
        console.log('service:', event.service.id);
    }

    onLatencyWarning(event) {
        console.log('-------- SERVICE LATENCY WARN! -------');
        console.log('service:', event.service.id);
    }

    onOutageCurrent(event) {
        console.log('-------- SERVICE STILL OUTAGE! -------');
        console.log('service:', event.service.id);
    }

    onOutageNew(event) {
        console.log('-------- SERVICE NEW OUTAGE! -------');
        console.log('service:', event.service.id);
    }
}

module.exports = ConsoleExtension;
