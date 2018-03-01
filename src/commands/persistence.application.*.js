'use strict';
const extend = require('gextend');
const Keypath = require('gkeypath');

class PersistenceApplicationCommand {
    
    execute(event) {
        const { action, identity, record, context } = event;
        const Service = context.models.Service;

        let logger = context.getLogger('application-cmd');

        const topic = `co/registry/${identity}/${action}`;

        logger.info('Persistence Application Command', action);
        logger.info('Notify clients, topic: "%s"', topic);

        /*
         * Notify all clients of a new Application.
         */
        context.pubsub.publish(topic, {
            topic,
            record
        });

        context.io.emit('status.update', {
            topic, 
            record
        });

        if(action === 'destroy') {
            return;
        }

        let health = Keypath.get(record, 'data.health', false);

        /**
         * Did the application send monitoring
         * information using the health attribute?
         *
         * Also, we need to take into account the
         * current action: Are we creating a new
         * application? Are we updating an existing
         * one?
         * If new app, let's create a service.
         * Else we might want to pause the current
         * service/task.
         */
        if (!health) {
            /*
             * Check to see if we have a Service for this application.
             */

            return Service.find({ application: record.id }).then((services = []) => {
                /*
                 * if we do, set active=false.
                 */
                if (services.length === 0) return;

                services.map(item => {
                    return item.id;
                });

                return Service.update(services, { active: false });
            });
        }

        /*
         * Collect default health values.
         */
        const config = Keypath.get(context, 'config.service', {});

        const service = extend({}, config.defaults, health);

        /**
         * health.url is a deprecated attribute.
         */
        if(health.url) {
            service.endpoint = health.url;
            delete service.url;
        }
        
        /** 
         * Look for a service with the given endpoint.
         */
        const criteria = {
            endpoint: service.endpoint
        };

        /**
         * Store a reference to the source application.
         */
        service.application = record.id;

        return Service.updateOrCreate(criteria, service);
    }
}

module.exports = PersistenceApplicationCommand;
