import Home from '../pages/Home.html';
import ApplicationView from '../pages/ApplicationView.html';
import ApplicationAdd from '../pages/ApplicationAdd.html';
import ApplicationEdit from '../pages/ApplicationEdit.html';

const components = {
    Home,
    ApplicationAdd,
    ApplicationEdit,
    ApplicationView,
};

const routes = {
    '/': Home,
    '/application/add': ApplicationAdd,
    '/application/:appid/edit': ApplicationEdit,
    '/application/:appid': ApplicationView,
};

export {routes, components};