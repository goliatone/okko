'use strict';
import {BaseCollection} from './BaseCollection';
import {ApplicationModel} from './ApplicationModel';

export class ApplicationCollection extends BaseCollection {
    
    fromVO(results) {
        if(!results || !results.value) {
            return console.error('Invalid response');
        }
        
        results.value.forEach(vo => {
            this.push(new ApplicationModel({vo}));
        });
    }
}