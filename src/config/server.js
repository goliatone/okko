'use strict';

module.exports = {
    port: process.env.NODE_APP_PORT || 7331,
    /**
     * We have to delcare dependencies of sub apps here
     * because if we make the subapp wait for dependencies
     * then 
     */
    dependencies: ['persistence'],
    // viewsExt: 'html'
};
