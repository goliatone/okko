'use strict';
const extend = require('gextend');

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const defaults = {
    roundPrecision: 3,
    maxOutagesLimit: 10
};

class Insights {
    constructor(options={}) {
        this.init(options);
    }

    init(options={}) {
        extend(this, defaults, options);
    }

    getServices() {

        return this.storage.serviceFindAll().then(services => {
            const out = services.map(service => {
                return this.getGeneralServiceInfo(service);
            });
            return Promise.all(out);
        });
    }

    getService(id) {
        console.log('getService', id);

        return this.storage.serviceFindOne(id).then(async (service) => {
            const info = await this.getGeneralServiceInfo(service);

            if(!info) return;

            const now = Date.now();
            const lastWeek = now - WEEK;
            const lastDay = now - DAY;
            const lastHour = now - HOUR;

            const outagesLastWeek = await this.storage.getServiceOutagesSince(service, lastWeek);
            
            const outagesLastHour = outagesLastWeek.filter((outage) => {
                return outage.timestamp >= lastHour;
            });

            let uptimeInfoLastHour = this.getUptime(service, outagesLastHour, info.status.currentOutage, lastHour);

            let latencyLastWeek = await this.storage.getLatencySince(info.service, lastWeek, 'day');

            let latency24Hours = await this.storage.getLatencySince(info.service, lastDay, 'hour');

            let latencyLastHour = await this.storage.getLatencySince(info.service, lastHour, 'minute');

            info.status.lastWeek = info.status.lastWeek || {};
            info.status.lastWeek.latency = latencyLastWeek;

            info.status.lastHour = info.status.lastHour || {};
            info.status.lastHour.outages = outagesLastHour;
            info.status.lastHour.latency = latencyLastHour;
            info.status.lastHour.uptime = uptimeInfoLastHour.uptime;
            info.status.lastHour.downtime = uptimeInfoLastHour.totalDownTime;

            info.status.last24Hours.latency = latency24Hours;

            info.status.latestOtages = outagesLastWeek.slice(0, this.maxOutagesLimit);

            return info;
        });
    }

    getUptime(service, outages, currentOutage, since) {
        
        let totalDownTime = 0;
        const NOW = Date.now();
        const createdAt = new Date(service.createdAt).getTime();
        
        console.log('createdAt: %s since %s', createdAt, since);

        if(createdAt > since) {
            since = createdAt;
        }

        if(outages.length) {
            outages.forEach((outage) => {
                if(outage.timestamp >= since) {
                    totalDownTime += outage.downtime;
                }
            });
        }

        if(currentOutage) {
            if(currentOutage.timestamp >= since) {
                totalDownTime += (NOW - currentOutage.timestamp);
            } else {
                totalDownTime += (NOW - since);
            }
        }

        const totalTime = NOW - since;

        /** 
         * Percentage uptime 
         */
        const uptime = this.round((totalTime - totalDownTime) * 100 / totalTime, this.roundPrecision);

        if(uptime < 0 || uptime > 100) {
            console.error('Invalid uptime:');
            console.error('totalTime:', totalTime);
            console.error('currentOutage:', currentOutage);
            console.error('uptime:', uptime);
            console.error('totalDownTime:', totalDownTime);
        }

        return {
            uptime,
            totalDownTime
        };
    }

    round (number, decimals=2) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    getGeneralServiceInfo(service) {
        return this.storage.getCurrentOutage(service).then(async currentOutage => {
            
            const NOW = Date.now();
            const last24Hours = NOW - DAY;
            const lastWeek = NOW - WEEK;

            const outagesLastWeek = await this.storage.getServiceOutagesSince(service, lastWeek);

            const uptimeInfoLastWeek = this.getUptime(service, outagesLastWeek, currentOutage, lastWeek);

            const outagesLast24Hours = outagesLastWeek.filter( outage => {
                return outage.timestamp >= last24Hours;
            });

            const uptimeInfoLast24Hours = this.getUptime(service, outagesLast24Hours, currentOutage, last24Hours);

            return {
                service,
                status: {
                    currentOutage,
                    last24Hours: {
                        outages: outagesLast24Hours,
                        numberOutages: outagesLast24Hours.length,
                        downtime: uptimeInfoLast24Hours.totalDownTime,
                        uptime: uptimeInfoLast24Hours.uptime
                    },
                    lastWeek: {
                        outages: outagesLastWeek,
                        numberOutages: outagesLastWeek.length,
                        downtime: uptimeInfoLastWeek.totalDownTime,
                        uptime: uptimeInfoLastWeek.uptime
                    }
                }
            };
        });
    }
}

module.exports = Insights;

// const RedisStorage = require('./persistence/redis');

// const storage = new RedisStorage({
//     host: '192.168.99.100'
// });

// const insights = new Insights({
//     storage
// });
// insights.getServices().then((out)=>console.log(JSON.stringify(out, null, 4)));

// insights.getService({ 
//     id: '3f7c5d12-0219-4b65-b56f-2f94207ef165' 
// }).then((out)=>console.log(JSON.stringify(out, null, 4)));