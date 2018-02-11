'use strict';

module.exports = function(router, config, subapp) {
    
    console.log('mouting route "Test"', arguments.length);

    subapp.get('/', function(req, res) {
        res.render('index', {
            message:'world',
            content: 'this is sparta'
        });
    });

    subapp.get('/application*', function(req, res) {
        res.render('index', {
            message:'world',
            content: 'this is sparta'
        });
    });
};