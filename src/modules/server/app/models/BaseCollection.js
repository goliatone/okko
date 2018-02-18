'use strict';


export class BaseCollection {
    
    constructor(data={}) {
        const self = this;
        let proxy = new Proxy([], {
            set(target, property, value) {
                target[property] = value;
                return true;
            },
            has(target, property) {
                return self[property] || target[property];
            },
            get(target, property) {
                if(typeof property === 'string' && self[property]) {
                    if(typeof self[property] === 'function') {
                        return self[property].bind(target);
                    }
                    return self[property];
                } else {
                    return target[property];
                }
            }
        });

        if(data.results) {
            proxy.fromVO(data.results);
        }

        return proxy;
    }

    findOne(id) {
        return this.find(record => record.id === id);
    }
}