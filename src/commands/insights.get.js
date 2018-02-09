'use strict';
const CoreCommand = require('../lib/CoreCommand');
const Insights = require('../lib/status-monitor/insights');
const RedisStorage = require('../lib/status-monitor/persistence/redis');

class InsightsGetCommand extends CoreCommand {

    execute(event) {
        const context = event.context;
        const logger = context.getLogger('insights');

        logger.info('Insights generate');

        const storage = new RedisStorage({
            host: '192.168.99.100'
        });

        const insights = new Insights({
            storage
        });

        return insights.getServices().then((out) => {
            console.log(JSON.stringify(out, null, 4));
            //This should be handled by base command.
            
            if(event.respondTo) {
                event.respondTo(null, out);
            }

            return out;
        });
    }

    static describe(prog, cmd) {

    }
}

InsightsGetCommand.DEFAULTS = {};
InsightsGetCommand.COMMAND_NAME = 'insights.get';
InsightsGetCommand.DESCRIPTION = 'Generate insights for all services';

module.exports = InsightsGetCommand;