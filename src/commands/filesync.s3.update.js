/*jshint esversion:6, node:true*/
'use strict';

const Command = require('core.io-filesync').command;

/**
 * dataSync: Sincronize models after file updates.
 *
 * Commands execute in the context of the app,
 * meaning this === app.
 */
module.exports = Command;
