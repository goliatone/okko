'use strict';

/*
 * http://patorjk.com/software/taag/#p=display&h=2&v=2&c=bash&w=.&f=ANSI%20Shadow&t=core.io-registry
 */
const banner = require('fs').readFileSync('./config/app.banner.txt', 'utf-8');
const resolve = require('path').resolve;

module.exports = {
    banner,
    name: 'core.io-registry',
    basepath: resolve('./'),
    environment: process.env.NODE_ENV || 'development',
    registry: false
};
