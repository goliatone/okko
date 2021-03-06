'use strict';

const BaseModel = require('core.io-persistence').BaseModel;

const schema = {
    identity: 'application',
    exportName: 'Application',
    connection: 'development',
    attributues: {
        identifier: {
            type: 'text',
            unique: true,
        },
        appId: {
            type: 'string',
            index: true
        },
        hostname: 'string',
        environment: {
            type: 'string'
        },

        online: {
            type: 'boolean',
            defaultsTo: false
        },

        services: {
            collection: 'service',
            via: 'application'
        },

        data: 'json',

        label: 'string',
        description: 'string',
    },
    createFromPayload: function (payload) {
        const attrs = [
            'appId',
            'hostname',
            'identifier',
            'environment'
        ];

        const values = {
            online: true
        };

        attrs.forEach(attr => {
            values[attr] = payload[attr];
        });

        Object.keys(payload).forEach(key => {
            if (attrs.includes(key)) return;

            if (!values.data) {
                values.data = {};
            }
            values.data[key] = payload[key];
        });

        const criteria = {};

        if (values.identifier) {
            criteria.identifier = payload.identifier;
        } else {
            values.identifier =
            criteria.identifier = makeIdentifier(payload);
        }

        /**
         * We migth have an application online already... 
         * so we just want to update.
         */
        return this.updateOrCreate(criteria, values);
    }
};

module.exports = BaseModel.extend(schema);

module.exports.schema = schema;

function makeIdentifier({appId, environment, hostname}) {
    return (`${appId}.${environment}@${hostname}`).toLowerCase();
}