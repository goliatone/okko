'use strict';

const ServicePingCommand = require('../commands/service.ping');
const InsightsGetCommand = require('../commands/insights.get');
const ServiceLatencyCommand = require('../commands/service.id.latency');
const ServiceIdInsightsCommand = require('../commands/service.id.insights');

/**
 * Attach available commands to the running cli instance.
 * 
 * @param {CliApp} cli 
 * @param {String} namespace 
 */
module.exports.attach = function $attach(cli, namespace = false) {
    const config = {
        namespace,
        prog: cli.prog,
        context: cli.context
    };

    ServicePingCommand.attach(config);
    InsightsGetCommand.attach(config);
    ServiceLatencyCommand.attach(config);
    ServiceIdInsightsCommand.attach(config);
    
};