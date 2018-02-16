'use strict';
import extend from'gextend';

const defaults = {
    attributes: [

    ]
};

export class ServiceModel {
    constructor(data) {
        if(data.vo) {
            this.fromVO(data.vo);
        }
    }

    fromVO(vo) {
        console.log('VO', vo);
        extend(this, vo);
    }
}


