'use strict';

const spigot = require('stream-spigot');
// https://github.com/dulichan/ts-rollup
const agg = require('timestream-aggregates');
const concat = require('concat-stream');

module.exports = {
    /**
     * s, sec, secs, second, seconds
     * m, min, mins, minute, minutes
     * h, hr, hrs, hour, hours
     * d, day, days
     * w, wk, wks, week, weeks
     * M, mon, mons, month, months
     * q, qtr, qtrs, quarter, quarters
     * y, yr, yrs, year, years
     */
    aggregate: function(arr, timeunit, cb) {
        spigot({ objectMode: true }, arr)
            .pipe(agg.mean('t', timeunit))
            .pipe(concat(cb));
    }
};
