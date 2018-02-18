'use strict';
import {ServiceModel} from './ServiceModel';
import {BaseCollection} from './BaseCollection';

export class ServiceCollection extends BaseCollection {
    
    fromVO(results) {
        if(!results || !results.value) {
            return console.error('Invalid response');
        }
        
        results.value.forEach(vo => {
            this.push(new ServiceModel({vo}));
        });
    }
}