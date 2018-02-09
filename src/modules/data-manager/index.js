/*jshint esversion:6, node:true*/
'use strict';

const Manager = require('core.io-data-manager');

/*
 * Expose `init` function. This get's
 * called by core.io plugin manager.
 */
module.exports.init = Manager.init;

/*
 * Set explicitly the name of this
 * module. Otherwise it would have
 * been `data-manager` per the directory
 * name.
 */
module.exports.alias = 'datamanager';
