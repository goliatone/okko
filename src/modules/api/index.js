/*jshint esversion:6, node:true*/
'use strict';

const initializeSubapp = require('core.io-express-server').initializeSubapp;

/** 
 * This is a shell express application
 * that is wired to load middleware and
 * 
 */
const App = require('core.io-express-server').defaultApp();

/*
 * This adaptor brings up an express subapp
 * to provide API enpoints. 
 * It relies on the server module, which is the
 * bare bones express server to which we mount 
 * different sub applications.
 */
module.exports.init = initializeSubapp(App, 'api');
