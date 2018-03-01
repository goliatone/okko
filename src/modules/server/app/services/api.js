'use strict';
import { ServiceModel } from '../models/ServiceModel';
import { InsightModel } from '../models/InsightModel';
import { ApplicationModel } from '../models/ApplicationModel';

import { ServiceCollection } from '../models/ServiceCollection';
import { InsightsCollection } from '../models/InsightsCollection';
import { ApplicationCollection } from '../models/ApplicationCollection';

function createApplication(data) {
    return fetch('/api/application', {
        method: 'POST',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            return res.json();
        })
        .then(json => {
            return new ApplicationModel({
                vo: json.value
            });
        });
}

function updateApplication(id, data) {
    return fetch('/api/application/' + id, {
        method: 'PUT',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            return res.json();
        })
        .then(json => {
            return new ApplicationModel({
                vo: json.value
            });
        });
}

function deleteApplication(id) {
    if (typeof id === 'object') id = id.id;

    return fetch('/api/application/' + id, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    }).then(res => {
        return res.json();
    });
}

function getApplication(id) {
    return fetch('/api/application/' + id)
        .then(res => {
            return res.json();
        })
        .then(json => {
            return new ApplicationModel({
                vo: json.value
            });
        });
}

function getApplications() {
    return fetch('/api/applications')
        .then(res => {
            return res.json();
        })
        .then(results => {
            return new ApplicationCollection({results});
        });
}

function getServices() {
    return fetch('/api/services')
        .then(res => {
            return res.json();
        })
        .then(results => {
            return new ServiceCollection({results});
        });
}

function getInsights() {
    return fetch('/api/insights').then(res => {
        return res.json();
    })
    .then(results => {
        return new InsightsCollection({results});
    });
}

function getInsightsFor(application) {
    return getInsights().then(insights => {
        return insights.find(insight => {
            return (insight.application = application);
        });
    });
}

function getLatencyData(id, interval='hour') {
    // let serviceId = service.findBy({application: id});
    id = 'afc4ea21-c148-4dcc-b3b6-974c07b69bcb'
    return fetch(`/api/service/${id}/latency?interval=${interval}`)
        then(res =>{ 
            let out = res.json();
            console.log('out', out);
            return out;
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
                services.map(service => {
                    applications.map(application => {
                        if (application.id === service.application) {
                            application.service = service;

                            insights.map(insight => {
                                if (insight.service.id === service.id) {
                                    application.insights = insight;
                                }
                            });
                        }
                    });
                });

                resolve(applications);
            }
        );
    });
}

export default {
    getLatencyData,
    getInsights,
    getApplication,
    getApplications,
    getInsightsFor,
    getServices,
    createApplication,
    deleteApplication,
    updateApplication,
    buildApplicationInsights
};
