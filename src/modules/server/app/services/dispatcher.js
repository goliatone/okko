'use strict';

import EVENT_TYPES from './constants';

const _handlers = {};

export default {
    
    EVENT_TYPES,

    handle(eventName, handler) {
        
        if(arguments.length === 1) {
            handler = eventName.handler;
            eventName = eventName.type;
        }
        
        const handlers =
            _handlers[eventName] || (_handlers[eventName] = []);
        handlers.push(handler);

        return {
            cancel: function() {
                const index = handlers.indexOf(handler);
                if (~index) handlers.splice(index, 1);
            }
        };
    },
    dispatch(eventName, data={}) {
        
        if(typeof eventName === 'object') {
            data = eventName;
            eventName = data.type;
        } else if(!data.type) {
            data.type = eventName;
        }

        const handlers =
            eventName in _handlers && _handlers[eventName].slice();

        if (!handlers) { 
            return console.log('No handlers for %s', eventName);
        }

        for (var i = 0; i < handlers.length; i += 1) {
            handlers[i].call(this, data);
        }
    },
    cancel(eventName, handler) {

        if(arguments.length === 1) {
            handler = eventName.handler;
            eventName = eventName.type;
        }
        
        const handlers =
            _handlers[eventName] || (_handlers[eventName] = []);
        const index = handlers.indexOf(handler);
        if (~index) handlers.splice(index, 1);
    }
};
