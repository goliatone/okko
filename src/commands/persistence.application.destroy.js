'use strict';
const extend = require('gextend');
const Keypath = require('gkeypath');

class PersistenceApplicationCommand {
    execute(event) {
        let { action, identity, record, context } = event;
        const Service = context.models.Service;

        let logger = context.getLogger('application-destroy');

        logger.info('Persistence Application Command', action);
        logger.info('Records', record);

        if(!record) {
            logger.warn('No records found');
        }

        if(!Array.isArray(record)) {
            record = [record];
        }

        record.map(app => {
            //TODO: We need to cascade delete
            Service.destroy({application: app.id});
        });
    }
}

module.exports = PersistenceApplicationCommand;
