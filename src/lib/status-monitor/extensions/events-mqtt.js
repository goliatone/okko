'use strict';

class EventExtension {
    constructor(monitor, config) {
        monitor.on('monitor.service.back', this.onServiceBack);
        monitor.on('monitor.service.ok', this.onServiceOk);
        monitor.on('monitor.service.ko', this.onServiceKo);
        monitor.on('monitor.latency.warning', this.onLatencyWarning);
        monitor.on('monitor.outage.current', this.onOutageCurrent);
        monitor.on('monitor.outage.new', this.onOutageNew);
    }

    onServiceBack(event) {}

    onServiceOk(event) {}

    onServiceKo(event) {}

    onLatencyWarning(event) {}

    onOutageCurrent(event) {}

    onOutageNew(event) {}
}

module.exports = EventExtension;
