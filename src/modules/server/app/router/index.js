'use strict';
import {routes, components} from './routes';
import createRouter from './create-router';

console.warn('createRouter');

const router = createRouter(routes);

export default router;