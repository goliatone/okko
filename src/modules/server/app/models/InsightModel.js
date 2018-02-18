'use strict';
import extend from'gextend';

const defaults = {
    attributes: [
    ]
};

export class InsightModel {
    
    constructor(data) {
        if(data.vo) {
            this.fromVO(data.vo);
        }
    }

    fromVO(vo) {
        console.log('create InsightModel:', vo);
        extend(this, vo);
        this.application = vo.service.id;
    }
}
