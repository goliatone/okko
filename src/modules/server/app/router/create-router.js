'use strict';
import history from './history';
import Route from 'route-parser';

/**
 * Create router
 * Routes are strings that map to an svelte
 * component.
 * 
 * 
 * @param {Object} routes Configuration object
 */
const createRouter = routes => {
    /** 
     * DOM element to attach content/pages.
     */
    let target;
    /** 
     * Component instance, we save a 
     * reference to created components
     * when our route object is a function.
     */
    let content;
    /** 
     * history listener  
     */
    let unlisten;

    const createRouteBehavior = route => {
        
        /**
         * Handle functins, in our case 
         * those are usually svelte Components.
         */
        if (typeof route === 'function') {
            const Component = route;
            return input => (content = new Component(input));
        }

        /**
         * We support internal redirects as 
         * object:
         * '/route/redirect': {redirect: '/home'}
         */
        if (typeof route === 'object') {
            if (route.redirect) {
                return () => history.push(route.redirect);
            }
        }

        /**
         * We support internal redirects as 
         * strings:
         * '/route/redirect': '/home'
         */
        if (typeof route === 'string') {
            return () => history.push(route);
        }

        return () => {};
    };

    /** 
     * Parse the routes object. Here we
     * build our entries in route/behavior
     * objects.
     * 
     * TODO: This should be configurable.
     * We might want to have a diferent
     * way to define routes, say we want 
     * to be able to name routes so we 
     * can then either trigger them by 
     * name or reverse the route from 
     * a name.
    */
    const routeData = Object.keys(routes)
        .map(path => [path, routes[path]])
        .map(([path, value]) => ({
            route: new Route(path),
            behavior: createRouteBehavior(value)
        }));

    /**
     * The `location` argument implements a subset
     * of the `window.location` interface:
     * - location.pathname
     * - location.search
     * - location.hash
     * 
     * Action might be one of:
     * - POP
     * - PUSH
     * - REPLACE
     * 
     * @argument {Object} location
     */     
    const handleRouteChange = (location, action) => {
        //We might want to do this in middleware?
        // if(location.pathname === history.location.pathname) {
        //     if(location.hash && content) {
        //         return content.set({hash: location.hash});
        //     }
        // }

        if (content && content.teardown) content.teardown();

        for (let i = 0; i < routeData.length; i += 1) {
            /** 
             * data will be false when the route does not
             * match location. In case is a match will return
             * either an empty object or an object with 
             * captured parameters.
             */
            const data = routeData[i].route.match(location.pathname);
            
            if (data) {
                /**
                 * data and target are relevant for
                 * Components. 
                 * - target: Component will render to it.
                 * - data: All captured parameters
                 * will be available to components on
                 * their data object.
                 */
                routeData[i].behavior({ 
                    data, 
                    target, 
                });
                break;
            }
        }
    };

    return {
        start: (location, targetElement) => {
            
            target = targetElement;

            /**
             * Listen for changes in URL and handle
             * accordingly.
             */
            unlisten = history.listen(handleRouteChange);
            
            handleRouteChange(location);
        },
        teardown: () => {
            if (!unlisten) return;
            unlisten();
            unlisten = undefined;
        },
        go: _go,
        goto: _goto,
        replace: _replace,
        goForward: _goForward,
        goBack: _goBack,
        listen: _listen,
    };
};

function _goto(path) {
    history.push(path);
}

function _goBack() {
    history.goBack();
}

function _goForward() {
    history.goForward();
}

function _replace(path){
    history.replace(path);
}

function _go(n){
    history.go(n);
}

function _listen(fn) {
    return history.listen(fn);
}

/**
 * Push a new entry onto the history stack. 
 * @param {String} path URI
 */
createRouter.goto = _goto;

/**
 * Expose goBack to go back in the
 * history stack. 
 */
createRouter.goBack = _goBack;

/**
 * Expose goForward to go back in the
 * history stack. 
 */
createRouter.goForward = _goForward;

createRouter.replace = _replace;

createRouter.go = _go;

createRouter.listen = _listen;

export default createRouter;