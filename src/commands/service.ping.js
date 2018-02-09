'use strict';
const CoreCommand = require('../lib/CoreCommand');

class ServicePingCommand extends CoreCommand {
    
    execute(event) {
        const context = event.context;
        const logger = context.getLogger('service-ping');

        logger.info('Here, here, here');
        logger.info('keys', Object.keys(event));
        logger.info('kakakaka');
    }

    static describe(prog, cmd) {
        cmd.option('--endpoint, -e <host>', 
            'Endpoint we want to check', 
            prog.STRING
        );
    }
}

ServicePingCommand.DEFAULTS = {
    options: {
        command: 'npm start',
    }
};

ServicePingCommand.COMMAND_NAME = 'service.ping';
ServicePingCommand.DESCRIPTION = 'Ping service';

module.exports = ServicePingCommand;