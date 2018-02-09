'use strict';

module.exports = {
    dependencies: ['persistence'],
    middleware: {
        use:[
            'poweredBy',
            // 'compression',
            'cors',
            // 'logger',
            // 'requestId',
            'bodyParser',
            // 'passport',
            'routes'
        ]
    }
};