'use strict';

module.exports.init = function(context, config) {
    const _logger = context.getLogger('io');

    context.resolve('server').then(server => {
        const transport = server.transport;

        const io = require('socket.io')(transport);

        context.provide('io', io);

        if(!config.middleware) config.middleware = [];

        io.on('connection', function $onConnection(socket){
            socket.on('command', function $onCommand(command){
                console.log('COMMAND:', command.action, command.data);
            });
        });
    });
};