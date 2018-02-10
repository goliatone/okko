'use strict';
const cache = {};
cache.applications = {};
cache.services = {};
cache.insights = {};

function getApplication(id) {
    return fetch('/api/application/' + id)
        .then(res => {
            return res.json();
        })
        .then(json => {
            cache.applications[json.value.id] = json.value;
            return json.value;
        });
}

function getApplications() {
    return fetch('/api/applications')
        .then(res => {
            return res.json();
        })
        .then(json => {
            
            json.value.map(app => {
                console.log('id', app.id);
                cache.applications[app.id] = app;
            });

            return json;
        });
}

function getServices() {
    return fetch('/api/services').then(res => {
        return res.json();
    })
    .then(json =>{
        
        json.value.map(service => {
            cache.services[service.id] = service;
        });

        return json;
    });
}

function getInsights() {
    return fetch('/api/insights').then(res => {
        return res.json();
    });
}

function buildApplicationInsights() {
    let data = [];
    let services = getServices();
    let applications = getApplications();
    let insights = getInsights();

    return new Promise((resolve, reject) => {
        Promise.all([services, applications, insights]).then(
            ([services, applications, insights]) => {
                services = services.value;
                applications = applications.value;
                insights = insights.value;

                services.map(service => {
                    applications.map(application => {
                        if (application.id === service.application) {
                            application.service = service;
                        }
                        insights.map(insight => {
                            if (insight.service.id === service.id) {
                                application.insights = insight;
                            }
                        });
                    });
                });

                resolve(applications);
            }
        );
    });
}

export default {
    cache,
    getInsights,
    getApplication,
    getApplications,
    getServices,
    buildApplicationInsights
};
