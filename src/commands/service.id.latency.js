'use strict';
const CoreCommand = require('../lib/CoreCommand');
const Insights = require('../lib/status-monitor/insights');
const RedisPersistence = require('../lib/status-monitor/persistence/redis');

class ServiceIdLatencyCommand extends CoreCommand {
    execute(event) {
        const context = event.context;
        const logger = context.getLogger('service id insights');

        const id = event.id;
        const interval = event.interval || false;

        logger.info('Get latency for service %s at interval %s', id, interval);


        const storage = new RedisPersistence({
            host: '192.168.99.100'
        });

        return storage.getLatencySince({id}, '-inf', interval).then(out => {
            console.log(JSON.stringify(out, null, 4));
            //This should be handled by base command.
            
            if(event.respondTo) {
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

        cmd.option(
            '--interval <slice>', 
            'Aggregate interval <slice> that will partition our aggregates.'
        );
    }
}

ServiceIdLatencyCommand.DEFAULTS = {

};

ServiceIdLatencyCommand.COMMAND_NAME = 'service.id.latency';
ServiceIdLatencyCommand.DESCRIPTION = 'Retrieve latency stats for a given service';

module.exports = ServiceIdLatencyCommand;