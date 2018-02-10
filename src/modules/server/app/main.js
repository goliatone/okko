'use strict';

import App from './Application.html';

const app = new App({
    //this breaks the layout, it does not support being wrapped by div
    // target: document.querySelector('#app')
    target: document.getElementsByTagName('body')[0]
});