'use strict';
const CoreCommand = require('../lib/CoreCommand');
const Insights = require('../lib/status-monitor/insights');
const RedisStorage = require('../lib/status-monitor/persistence/redis');

class ServiceIdInsightsCommand extends CoreCommand {
    execute(event) {
        const context = event.context;
        const logger = context.getLogger('service id insights');

        const id = event.id;

        logger.info('Get insights for service: %s', id);

        //TODO: Make lazy loading...
        const serverIP = process.env.NODE_REDIS_IP || '192.168.99.100';
        const storage = new RedisStorage({
            host: serverIP
        });

        const insights = new Insights({
            storage
        });

        return insights.getService({ id }).then(out => {
            console.log(JSON.stringify(out, null, 4));
            //This should be handled by base command.

            if (event.respondTo) {
                event.respondTo(null, out);
            }

            return out;
        });
    }

    static describe(prog, cmd) {
        cmd.argument(
            '<id>',
            'Service id'
        );
    }
}

ServiceIdInsightsCommand.DEFAULTS = {};

ServiceIdInsightsCommand.COMMAND_NAME = 'service.id.insights';
ServiceIdInsightsCommand.DESCRIPTION = 'Retrieve insights for a given service';

module.exports = ServiceIdInsightsCommand;