'use strict';

import moment from 'moment';

export default {
    time(downtime) {
        return moment(downtime, 'h:mm:ss').format();
    },
    date(time) {  
        return moment(time).format('YYYY-MM-DD');
    },
    formatDowntime(downtime) {
        function pad(n, z) {
            z = z || 2;
            return ('00' + n).slice(-z);
        }

        let ms = downtime % 1000;
        downtime = (downtime - ms) / 1000;

        let secs = downtime % 60;
        downtime = (downtime - secs) / 60;

        let mins = downtime % 60;
        let hrs = (downtime - mins) / 60;

        return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
    }
};
