// import createHistory from 'history/createHashHistory';
import createHistory from 'history/createBrowserHistory';

/** 
 * The history package exposes 3 methods for 
 * creating a history object:
 * createBrowserHistory
 * createMemoryHistory
 * createHashHistory 
 */
const history = createHistory();

/**
 * Each `history` object has the following props:
 * - history.length
 * - history.location
 * - history.action
 * 
 */
export default history;