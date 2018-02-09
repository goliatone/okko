/*jshint esversion:6, node:true*/
'use strict';

const express = require('express');

/**
 * Standard entry point for TrackFinder
 * routes. We are not in the appliction
 * context scope.
 *
 * @method exports
 * @param  {Object} router Express router
 * @param  {Object} config
 * @param  {Object} subapp Express app to
 *                         be mounted.
 * @return {void}
 */
module.exports = function(router, config, subapp) {
    initialize(subapp, config);
};

function initialize(router, config) {
    const context = config.context;
    const logger = context.getLogger('endpoints');

    const Service = context.models.Service;
    const Application = context.models.Application;

    /**
     * GET home page.
     */
    router.get('/health', function healthHandler(req, res, next) {
        res.send({
            success: true
        });
    });

    /**
     * Register a new application instance.
     * A new application get's an ID which is
     * sent back as a response. Which should be
     * used to de-register it.
     */
    router.post('/register', function registrerHandler(req, res, next) {
        let body = req.body;

        logger.info('POST /register %j', body);

        Application.createFromPayload(body)
            .then((result = { identifier: null }) => {
                logger.info(
                    'registered app with identifier %s',
                    result.identifier
                );
                res.send({
                    success: true,
                    value: {
                        identifier: result.identifier
                    }
                });
            })
            .catch(next);
    });

    /**
     * Un-register an application.
     * This should be called by an application
     * after it first registerd.
     */
    router.post('/unregister', function registrerHandler(req, res, next) {
        const identifier = req.body.identifier;

        logger.info('POST /unregister %j', identifier, req.originalUrl);

        //TODO: if no identifier provided, we should try to use
        //originalUrl instead.
        Application.update({ identifier }, { online: false })
            .then(result => {
                res.send({
                    success: true
                });
            })
            .catch(next);
    });

    router.get('/applications', function listApplications(req, res, next) {
        const query = req.query;
        //we should sanitize query :)
        Application.find(query).then(result => {
            res.send({
                success: true,
                value: result
            });
        });
    });

    router.get('/application/:id', function getApplication(req, res, next) {
        const id = req.params.id;
        Application.findOne(id).then(result => {
            res.send({
                success: true,
                value: result
            });
        });
    });

    router.get('/application/:id/services', function getApplication(req, res, next) {
        const application = req.params.id;
        Service.find({application}).then(result => {
            res.send({
                success: true,
                value: result
            });
        });
    });

    router.get('/services', function getServices(req, res, next) {
        const query = req.query;
        //we should sanitize query :)
        Service.find(query).then(result => {
            res.send({
                success: true,
                value: result
            });
        });
    });

    router.get('/service/:id', function getService(req, res, next) {
        const id = req.params.id;
        Service.findOne(id).then(result => {
            res.send({
                success: true,
                value: result
            });
        });
    });

    router.get('/insights', function getInsights(req, res, next) {
        
        context.emit('insights.get', {
            respondTo: function(err, result) {
                if(err) next(err);
                else res.send({
                    success: true,
                    value: result
                });
            }
        });
    });

    router.get('/service/:id/insights', function getInsightsFor(req, res, next){
        const id = req.params.id;
        console.log('---> id', id);
        
        context.emit('service.id.insights', {
            id,
            respondTo: function(err, result) {
                if(err) next(err);
                else res.send({
                    success: true,
                    value: result
                });
            }
        });
    });

    return router;
}
