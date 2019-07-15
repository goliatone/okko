'use strict';

module.exports = {
    moduleName: 'persistence',
    seedDB: true,
    timeout: 30 * 1000,
    orm: {
        adapters: {
            'disk': require('sails-disk'),
            // 'sqlite': require('waterline-sqlite3-es5')
            'redis': require('sails-redis')
        },
        connections: {
            development: {
                // adapter: 'disk'
                adapter: 'redis',
                port: 6379,
                host: process.env.NODE_REDIS_IP || '192.168.99.100',
                password: null,
                database: null,
                options: {

                    // low-level configuration
                    // (redis driver options)
                    parser: 'hiredis',
                    'return_buffers': false,
                    'detect_buffers': false,
                    'socket_nodelay': true,
                    'no_ready_check': false,
                    'enable_offline_queue': true
                }
            },
            staging: {
                adapter: 'disk'
            }
        },
        defaults: {
            migrate: process.env.NODE_ENV === 'production' ? 'safe' : 'drop',
            connection: process.env.NODE_PERSISTENCE_CONNECTION || 'production'
        }
    }
};