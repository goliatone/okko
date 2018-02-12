'use strict';

import App from './Application.html';
import store from './models/RootStore';
import api from './services/api';
import bus from './services/dispatcher';
import history from './services/history';

const states = bus.EVENT_TYPES;

bus.requestCompiledData = () => {
    bus.dispatch(bus.EVENT_TYPES.REQUEST_COMPILE_DATA);
};

bus.requestApplicationById = (id) =>{
    bus.dispatch(bus.EVENT_TYPES.REQUEST_APPLICATION_ID, {id});
};

bus.goto = (uri, data={}) => {
    bus.dispatch(bus.EVENT_TYPES.NAVIGATION_GOTO, {uri, data});
};

bus.handle(states.REQUEST_APPLICATION_ID, data => {
    const promise = api.getApplication(data.id);
    promise.then(application => {
        store.set({application});
    });
    store.set({application: promise});
});

bus.handle(states.NAVIGATION_GOTO, data => {
    console.log('NAVIGATION_GOTO', data);
    history.push(data.uri);
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

const app = new App({
    //this breaks the layout, it does not support being wrapped by div
    // target: document.querySelector('#wrapper')
    target: document.getElementsByTagName('body')[0],
    store: () => store,
});

window.app = app;
window.bus = bus;
window.rootStore = store;