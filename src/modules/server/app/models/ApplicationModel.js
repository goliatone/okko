'use strict';
import extend from'gextend';
import {ServiceModel} from './ServiceModel';

const defaults = {
    attributes: [
        'uuid', 
        'identifier', 
        'appId', 
        'environment', 
        'data', 
        'hostname',
        'createdAt',
        'updatedAt',
        'online',
    ]
};

export class ApplicationModel  {
    
    constructor(data) {
        if(data.vo) {
            this.fromVO(data.vo);
        }
    }

    fromVO(vo) {
        console.log('create ApplicationModel:', vo);
        extend(this, vo);
    }

    sayHello() {
        return 'Hello ' + this.appId;
    }

    set service(vo) {
        this._service = new ServiceModel({vo});
    }

    get service() {
        return this._service;
    }
}


