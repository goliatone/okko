'use strict';
import {InsightModel} from './InsightModel';
import {BaseCollection} from './BaseCollection';

export class InsightsCollection extends BaseCollection {
    
    fromVO(results) {
        if(!results || !results.value) {
            return console.error('Invalid response');
        }
        
        results.value.forEach(vo => {
            this.push(new InsightModel({vo}));
        });
    }
}