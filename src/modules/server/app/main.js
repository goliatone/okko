'use strict';

import App from './Application.html';
import store from './models/RootStore';
import api from './services/api';
import bus from './services/dispatcher';
import history from './services/history';

const states = bus.EVENT_TYPES;

bus.requestCompiledData = () => {
    bus.dispatch(states.REQUEST_COMPILE_DATA);
};

bus.requestApplicationById = (id) =>{
    bus.dispatch(states.REQUEST_APPLICATION_ID, {id});
};

bus.updateApplication = (application) => {
    bus.dispatch(states.APPLICATION_UPDATE, {application});
};

bus.createApplication = (application) => {
    bus.dispatch(states.APPLICATION_CREATE, {application});
};

bus.deleteApplication = (id) => {
    bus.dispatch(states.APPLICATION_DELETE, {id});
};

bus.pauseApplicationMonitoring = (id) => {
    bus.dispatch(states.APPLICATION_PAUSE, {id});
};

bus.goto = (uri, data={}) => {
    bus.dispatch(states.NAVIGATION_GOTO, {uri, data});
};

bus.handle(states.REQUEST_APPLICATION_ID, data => {
    const promise = api.getApplication(data.id);
    promise.then(application => {
        store.set({application});
    });
    store.set({application: promise});
});

bus.handle(states.NAVIGATION_GOTO, data => {
    history.push(data.uri);
});

bus.handle(states.APPLICATION_CREATE, data => {
    console.log('create application', getAttributes(data.application));

    function getAttributes(obj) {
        let out = {};
        ['uuid', 'identifier', 'appId', 'environment', 'data', 'hostname'].map((attr)=>{
            out[attr] = obj[attr];
        });
        return out;
    }

    const promise = api.createApplication(getAttributes(data.application));

    promise.then(application => {
        bus.goto(`/application/${application.id}`);
    });
});

bus.handle(states.APPLICATION_DELETE, id => {
    api.deleteApplication(id).then(_ => {
        bus.goto('/');
    });
});

bus.handle(states.APPLICATION_UPDATE, data => {
    console.log('update application', data);

    function getAttributes(obj) {
        let out = {};
        ['uuid', 'identifier', 'appId', 'environment', 'data', 'hostname'].map((attr)=>{
            out[attr] = obj[attr];
        });
        return out;
    }

    const promise = api.updateApplication(data.id, getAttributes(data.application));

    promise.then(application => {
        bus.goto(`/application/${application.id}`);
    });
});

bus.handle(states.REQUEST_COMPILE_DATA, _ => {
    
    let promise = api.buildApplicationInsights();
    
    /*
     * Here we should parse and create our
     * data set. 
     */
    promise.then(applications => {
        store.set({
            online: 2, 
            offline: 0,
            applications
        });
    });

    store.set({applications: promise});
});

bus.handle(states.APPLICATION_PAUSE, data => {
    console.warn('pause application', data);
});

const app = new App({
    //this breaks the layout, it does not support being wrapped by div
    // target: document.querySelector('#wrapper')
    target: document.getElementsByTagName('body')[0],
    store: () => store,
});

window.app = app;
window.bus = bus;
window.rootStore = store;