var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
	'use strict';

	function noop() {}

	function assign(target) {
		var k,
		    source,
		    i = 1,
		    len = arguments.length;
		for (; i < len; i++) {
			source = arguments[i];
			for (k in source) {
				target[k] = source[k];
			}
		}

		return target;
	}

	function appendNode(node, target) {
		target.appendChild(node);
	}

	function insertNode(node, target, anchor) {
		target.insertBefore(node, anchor);
	}

	function detachNode(node) {
		node.parentNode.removeChild(node);
	}

	function destroyEach(iterations) {
		for (var i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d();
		}
	}

	function createElement(name) {
		return document.createElement(name);
	}

	function createText(data) {
		return document.createTextNode(data);
	}

	function createComment() {
		return document.createComment('');
	}

	function addListener(node, event, handler) {
		node.addEventListener(event, handler, false);
	}

	function removeListener(node, event, handler) {
		node.removeEventListener(event, handler, false);
	}

	function setAttribute(node, attribute, value) {
		node.setAttribute(attribute, value);
	}

	function toNumber(value) {
		return value === '' ? undefined : +value;
	}

	function blankObject() {
		return Object.create(null);
	}

	function destroy(detach) {
		this.destroy = noop;
		this.fire('destroy');
		this.set = this.get = noop;

		if (detach !== false) this._fragment.u();
		this._fragment.d();
		this._fragment = this._state = null;
	}

	function differs(a, b) {
		return a !== b || a && (typeof a === 'undefined' ? 'undefined' : _typeof2(a)) === 'object' || typeof a === 'function';
	}

	function dispatchObservers(component, group, changed, newState, oldState) {
		for (var key in group) {
			if (!changed[key]) continue;

			var newValue = newState[key];
			var oldValue = oldState[key];

			var callbacks = group[key];
			if (!callbacks) continue;

			for (var i = 0; i < callbacks.length; i += 1) {
				var callback = callbacks[i];
				if (callback.__calling) continue;

				callback.__calling = true;
				callback.call(component, newValue, oldValue);
				callback.__calling = false;
			}
		}
	}

	function fire(eventName, data) {
		var handlers = eventName in this._handlers && this._handlers[eventName].slice();
		if (!handlers) return;

		for (var i = 0; i < handlers.length; i += 1) {
			handlers[i].call(this, data);
		}
	}

	function get(key) {
		return key ? this._state[key] : this._state;
	}

	function init(component, options) {
		component._observers = { pre: blankObject(), post: blankObject() };
		component._handlers = blankObject();
		component._bind = options._bind;

		component.options = options;
		component.root = options.root || component;
		component.store = component.root.store || options.store;
	}

	function observe(key, callback, options) {
		var group = options && options.defer ? this._observers.post : this._observers.pre;

		(group[key] || (group[key] = [])).push(callback);

		if (!options || options.init !== false) {
			callback.__calling = true;
			callback.call(this, this._state[key]);
			callback.__calling = false;
		}

		return {
			cancel: function cancel() {
				var index = group[key].indexOf(callback);
				if (~index) group[key].splice(index, 1);
			}
		};
	}

	function on(eventName, handler) {
		if (eventName === 'teardown') return this.on('destroy', handler);

		var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
		handlers.push(handler);

		return {
			cancel: function cancel() {
				var index = handlers.indexOf(handler);
				if (~index) handlers.splice(index, 1);
			}
		};
	}

	function set(newState) {
		this._set(assign({}, newState));
		if (this.root._lock) return;
		this.root._lock = true;
		callAll(this.root._beforecreate);
		callAll(this.root._oncreate);
		callAll(this.root._aftercreate);
		this.root._lock = false;
	}

	function _set(newState) {
		var oldState = this._state,
		    changed = {},
		    dirty = false;

		for (var key in newState) {
			if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
		}
		if (!dirty) return;

		this._state = assign({}, oldState, newState);
		this._recompute(changed, this._state);
		if (this._bind) this._bind(changed, this._state);

		if (this._fragment) {
			dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
			this._fragment.p(changed, this._state);
			dispatchObservers(this, this._observers.post, changed, this._state, oldState);
		}
	}

	function callAll(fns) {
		while (fns && fns.length) {
			fns.shift()();
		}
	}

	function _mount(target, anchor) {
		this._fragment.m(target, anchor);
	}

	function _unmount() {
		if (this._fragment) this._fragment.u();
	}

	function isPromise(value) {
		return value && typeof value.then === 'function';
	}

	function removeFromStore() {
		this.store._remove(this);
	}

	var proto = {
		destroy: destroy,
		get: get,
		fire: fire,
		observe: observe,
		on: on,
		set: set,
		teardown: destroy,
		_recompute: noop,
		_set: _set,
		_mount: _mount,
		_unmount: _unmount
	};

	function commonjsRequire() {
		throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
	}

	function unwrapExports(x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	/**
  * Copyright 2014-2015, Facebook, Inc.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree. An additional grant
  * of patent rights can be found in the PATENTS file in the same directory.
  */

	var warning = function warning() {};

	{
		warning = function warning(condition, format, args) {
			var len = arguments.length;
			args = new Array(len > 2 ? len - 2 : 0);
			for (var key = 2; key < len; key++) {
				args[key - 2] = arguments[key];
			}
			if (format === undefined) {
				throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
			}

			if (format.length < 10 || /^[s\W]*$/.test(format)) {
				throw new Error('The warning format should be able to uniquely identify this ' + 'warning. Please, use a more descriptive format than: ' + format);
			}

			if (!condition) {
				var argIndex = 0;
				var message = 'Warning: ' + format.replace(/%s/g, function () {
					return args[argIndex++];
				});
				if (typeof console !== 'undefined') {
					console.error(message);
				}
				try {
					// This error was thrown as a convenience so that you can use this stack
					// to find the callsite that caused this warning to fire.
					throw new Error(message);
				} catch (x) {}
			}
		};
	}

	var browser = warning;

	/**
  * Copyright 2013-2015, Facebook, Inc.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree. An additional grant
  * of patent rights can be found in the PATENTS file in the same directory.
  */

	var invariant = function invariant(condition, format, a, b, c, d, e, f) {
		{
			if (format === undefined) {
				throw new Error('invariant requires an error message argument');
			}
		}

		if (!condition) {
			var error;
			if (format === undefined) {
				error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
			} else {
				var args = [a, b, c, d, e, f];
				var argIndex = 0;
				error = new Error(format.replace(/%s/g, function () {
					return args[argIndex++];
				}));
				error.name = 'Invariant Violation';
			}

			error.framesToPop = 1; // we don't care about invariant's own frame
			throw error;
		}
	};

	var browser$2 = invariant;

	function isAbsolute(pathname) {
		return pathname.charAt(0) === '/';
	}

	// About 1.5x faster than the two-arg version of Array#splice()
	function spliceOne(list, index) {
		for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
			list[i] = list[k];
		}

		list.pop();
	}

	// This implementation is based heavily on node's url.parse
	function resolvePathname(to) {
		var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

		var toParts = to && to.split('/') || [];
		var fromParts = from && from.split('/') || [];

		var isToAbs = to && isAbsolute(to);
		var isFromAbs = from && isAbsolute(from);
		var mustEndAbs = isToAbs || isFromAbs;

		if (to && isAbsolute(to)) {
			// to is absolute
			fromParts = toParts;
		} else if (toParts.length) {
			// to is relative, drop the filename
			fromParts.pop();
			fromParts = fromParts.concat(toParts);
		}

		if (!fromParts.length) return '/';

		var hasTrailingSlash = void 0;
		if (fromParts.length) {
			var last = fromParts[fromParts.length - 1];
			hasTrailingSlash = last === '.' || last === '..' || last === '';
		} else {
			hasTrailingSlash = false;
		}

		var up = 0;
		for (var i = fromParts.length; i >= 0; i--) {
			var part = fromParts[i];

			if (part === '.') {
				spliceOne(fromParts, i);
			} else if (part === '..') {
				spliceOne(fromParts, i);
				up++;
			} else if (up) {
				spliceOne(fromParts, i);
				up--;
			}
		}

		if (!mustEndAbs) for (; up--; up) {
			fromParts.unshift('..');
		}if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');

		var result = fromParts.join('/');

		if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

		return result;
	}

	var resolvePathname$2 = Object.freeze({
		default: resolvePathname
	});

	var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
		return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
	};

	function valueEqual(a, b) {
		if (a === b) return true;

		if (a == null || b == null) return false;

		if (Array.isArray(a)) {
			return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
				return valueEqual(item, b[index]);
			});
		}

		var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
		var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);

		if (aType !== bType) return false;

		if (aType === 'object') {
			var aValue = a.valueOf();
			var bValue = b.valueOf();

			if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);

			var aKeys = Object.keys(a);
			var bKeys = Object.keys(b);

			if (aKeys.length !== bKeys.length) return false;

			return aKeys.every(function (key) {
				return valueEqual(a[key], b[key]);
			});
		}

		return false;
	}

	var valueEqual$2 = Object.freeze({
		default: valueEqual
	});

	var PathUtils = createCommonjsModule(function (module, exports) {
		exports.__esModule = true;
		var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
			return path.charAt(0) === '/' ? path : '/' + path;
		};

		var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
			return path.charAt(0) === '/' ? path.substr(1) : path;
		};

		var hasBasename = exports.hasBasename = function hasBasename(path, prefix) {
			return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
		};

		var stripBasename = exports.stripBasename = function stripBasename(path, prefix) {
			return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
		};

		var stripTrailingSlash = exports.stripTrailingSlash = function stripTrailingSlash(path) {
			return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
		};

		var parsePath = exports.parsePath = function parsePath(path) {
			var pathname = path || '/';
			var search = '';
			var hash = '';

			var hashIndex = pathname.indexOf('#');
			if (hashIndex !== -1) {
				hash = pathname.substr(hashIndex);
				pathname = pathname.substr(0, hashIndex);
			}

			var searchIndex = pathname.indexOf('?');
			if (searchIndex !== -1) {
				search = pathname.substr(searchIndex);
				pathname = pathname.substr(0, searchIndex);
			}

			return {
				pathname: pathname,
				search: search === '?' ? '' : search,
				hash: hash === '#' ? '' : hash
			};
		};

		var createPath = exports.createPath = function createPath(location) {
			var pathname = location.pathname,
			    search = location.search,
			    hash = location.hash;

			var path = pathname || '/';

			if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;

			if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;

			return path;
		};
	});

	unwrapExports(PathUtils);
	var PathUtils_1 = PathUtils.addLeadingSlash;
	var PathUtils_2 = PathUtils.stripLeadingSlash;
	var PathUtils_3 = PathUtils.hasBasename;
	var PathUtils_4 = PathUtils.stripBasename;
	var PathUtils_5 = PathUtils.stripTrailingSlash;
	var PathUtils_6 = PathUtils.parsePath;
	var PathUtils_7 = PathUtils.createPath;

	var _resolvePathname = resolvePathname$2 && resolvePathname || resolvePathname$2;

	var _valueEqual = valueEqual$2 && valueEqual || valueEqual$2;

	var LocationUtils = createCommonjsModule(function (module, exports) {
		exports.__esModule = true;
		exports.locationsAreEqual = exports.createLocation = undefined;

		var _extends = Object.assign || function (target) {
			for (var i = 1; i < arguments.length; i++) {
				var source = arguments[i];for (var key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key];
					}
				}
			}return target;
		};

		var _resolvePathname2 = _interopRequireDefault(_resolvePathname);

		var _valueEqual2 = _interopRequireDefault(_valueEqual);

		function _interopRequireDefault(obj) {
			return obj && obj.__esModule ? obj : { default: obj };
		}

		var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
			var location = void 0;
			if (typeof path === 'string') {
				// Two-arg form: push(path, state)
				location = (0, PathUtils.parsePath)(path);
				location.state = state;
			} else {
				// One-arg form: push(location)
				location = _extends({}, path);

				if (location.pathname === undefined) location.pathname = '';

				if (location.search) {
					if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
				} else {
					location.search = '';
				}

				if (location.hash) {
					if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
				} else {
					location.hash = '';
				}

				if (state !== undefined && location.state === undefined) location.state = state;
			}

			try {
				location.pathname = decodeURI(location.pathname);
			} catch (e) {
				if (e instanceof URIError) {
					throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
				} else {
					throw e;
				}
			}

			if (key) location.key = key;

			if (currentLocation) {
				// Resolve incomplete/relative pathname relative to current location.
				if (!location.pathname) {
					location.pathname = currentLocation.pathname;
				} else if (location.pathname.charAt(0) !== '/') {
					location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
				}
			} else {
				// When there is no prior location and pathname is empty, set it to /
				if (!location.pathname) {
					location.pathname = '/';
				}
			}

			return location;
		};

		var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
			return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
		};
	});

	unwrapExports(LocationUtils);
	var LocationUtils_1 = LocationUtils.locationsAreEqual;
	var LocationUtils_2 = LocationUtils.createLocation;

	var createTransitionManager_1 = createCommonjsModule(function (module, exports) {
		exports.__esModule = true;

		var _warning2 = _interopRequireDefault(browser);

		function _interopRequireDefault(obj) {
			return obj && obj.__esModule ? obj : { default: obj };
		}

		var createTransitionManager = function createTransitionManager() {
			var prompt = null;

			var setPrompt = function setPrompt(nextPrompt) {
				(0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time');

				prompt = nextPrompt;

				return function () {
					if (prompt === nextPrompt) prompt = null;
				};
			};

			var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
				// TODO: If another transition starts while we're still confirming
				// the previous one, we may end up in a weird state. Figure out the
				// best way to handle this.
				if (prompt != null) {
					var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

					if (typeof result === 'string') {
						if (typeof getUserConfirmation === 'function') {
							getUserConfirmation(result, callback);
						} else {
							(0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message');

							callback(true);
						}
					} else {
						// Return false from a transition hook to cancel the transition.
						callback(result !== false);
					}
				} else {
					callback(true);
				}
			};

			var listeners = [];

			var appendListener = function appendListener(fn) {
				var isActive = true;

				var listener = function listener() {
					if (isActive) fn.apply(undefined, arguments);
				};

				listeners.push(listener);

				return function () {
					isActive = false;
					listeners = listeners.filter(function (item) {
						return item !== listener;
					});
				};
			};

			var notifyListeners = function notifyListeners() {
				for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
					args[_key] = arguments[_key];
				}

				listeners.forEach(function (listener) {
					return listener.apply(undefined, args);
				});
			};

			return {
				setPrompt: setPrompt,
				confirmTransitionTo: confirmTransitionTo,
				appendListener: appendListener,
				notifyListeners: notifyListeners
			};
		};

		exports.default = createTransitionManager;
	});

	unwrapExports(createTransitionManager_1);

	var DOMUtils = createCommonjsModule(function (module, exports) {
		exports.__esModule = true;
		var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

		var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
			return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
		};

		var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
			return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
		};

		var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
			return callback(window.confirm(message));
		}; // eslint-disable-line no-alert

		/**
   * Returns true if the HTML5 history API is supported. Taken from Modernizr.
   *
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
   */
		var supportsHistory = exports.supportsHistory = function supportsHistory() {
			var ua = window.navigator.userAgent;

			if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

			return window.history && 'pushState' in window.history;
		};

		/**
   * Returns true if browser fires popstate on hash change.
   * IE10 and IE11 do not.
   */
		var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
			return window.navigator.userAgent.indexOf('Trident') === -1;
		};

		/**
   * Returns false if using go(n) with hash history causes a full page reload.
   */
		var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
			return window.navigator.userAgent.indexOf('Firefox') === -1;
		};

		/**
   * Returns true if a given popstate event is an extraneous WebKit event.
   * Accounts for the fact that Chrome on iOS fires real popstate events
   * containing undefined state when pressing the back button.
   */
		var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
			return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
		};
	});

	unwrapExports(DOMUtils);
	var DOMUtils_1 = DOMUtils.canUseDOM;
	var DOMUtils_2 = DOMUtils.addEventListener;
	var DOMUtils_3 = DOMUtils.removeEventListener;
	var DOMUtils_4 = DOMUtils.getConfirmation;
	var DOMUtils_5 = DOMUtils.supportsHistory;
	var DOMUtils_6 = DOMUtils.supportsPopStateOnHashChange;
	var DOMUtils_7 = DOMUtils.supportsGoWithoutReloadUsingHash;
	var DOMUtils_8 = DOMUtils.isExtraneousPopstateEvent;

	var createBrowserHistory_1 = createCommonjsModule(function (module, exports) {
		exports.__esModule = true;

		var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
			return typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
		} : function (obj) {
			return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === 'undefined' ? 'undefined' : _typeof2(obj);
		};

		var _extends = Object.assign || function (target) {
			for (var i = 1; i < arguments.length; i++) {
				var source = arguments[i];for (var key in source) {
					if (Object.prototype.hasOwnProperty.call(source, key)) {
						target[key] = source[key];
					}
				}
			}return target;
		};

		var _warning2 = _interopRequireDefault(browser);

		var _invariant2 = _interopRequireDefault(browser$2);

		var _createTransitionManager2 = _interopRequireDefault(createTransitionManager_1);

		function _interopRequireDefault(obj) {
			return obj && obj.__esModule ? obj : { default: obj };
		}

		var PopStateEvent = 'popstate';
		var HashChangeEvent = 'hashchange';

		var getHistoryState = function getHistoryState() {
			try {
				return window.history.state || {};
			} catch (e) {
				// IE 11 sometimes throws when accessing window.history.state
				// See https://github.com/ReactTraining/history/pull/289
				return {};
			}
		};

		/**
   * Creates a history object that uses the HTML5 history API including
   * pushState, replaceState, and the popstate event.
   */
		var createBrowserHistory = function createBrowserHistory() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			(0, _invariant2.default)(DOMUtils.canUseDOM, 'Browser history needs a DOM');

			var globalHistory = window.history;
			var canUseHistory = (0, DOMUtils.supportsHistory)();
			var needsHashChangeListener = !(0, DOMUtils.supportsPopStateOnHashChange)();

			var _props$forceRefresh = props.forceRefresh,
			    forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
			    _props$getUserConfirm = props.getUserConfirmation,
			    getUserConfirmation = _props$getUserConfirm === undefined ? DOMUtils.getConfirmation : _props$getUserConfirm,
			    _props$keyLength = props.keyLength,
			    keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;

			var basename = props.basename ? (0, PathUtils.stripTrailingSlash)((0, PathUtils.addLeadingSlash)(props.basename)) : '';

			var getDOMLocation = function getDOMLocation(historyState) {
				var _ref = historyState || {},
				    key = _ref.key,
				    state = _ref.state;

				var _window$location = window.location,
				    pathname = _window$location.pathname,
				    search = _window$location.search,
				    hash = _window$location.hash;

				var path = pathname + search + hash;

				(0, _warning2.default)(!basename || (0, PathUtils.hasBasename)(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');

				if (basename) path = (0, PathUtils.stripBasename)(path, basename);

				return (0, LocationUtils.createLocation)(path, state, key);
			};

			var createKey = function createKey() {
				return Math.random().toString(36).substr(2, keyLength);
			};

			var transitionManager = (0, _createTransitionManager2.default)();

			var setState = function setState(nextState) {
				_extends(history, nextState);

				history.length = globalHistory.length;

				transitionManager.notifyListeners(history.location, history.action);
			};

			var handlePopState = function handlePopState(event) {
				// Ignore extraneous popstate events in WebKit.
				if ((0, DOMUtils.isExtraneousPopstateEvent)(event)) return;

				handlePop(getDOMLocation(event.state));
			};

			var handleHashChange = function handleHashChange() {
				handlePop(getDOMLocation(getHistoryState()));
			};

			var forceNextPop = false;

			var handlePop = function handlePop(location) {
				if (forceNextPop) {
					forceNextPop = false;
					setState();
				} else {
					var action = 'POP';

					transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
						if (ok) {
							setState({ action: action, location: location });
						} else {
							revertPop(location);
						}
					});
				}
			};

			var revertPop = function revertPop(fromLocation) {
				var toLocation = history.location;

				// TODO: We could probably make this more reliable by
				// keeping a list of keys we've seen in sessionStorage.
				// Instead, we just default to 0 for keys we don't know.

				var toIndex = allKeys.indexOf(toLocation.key);

				if (toIndex === -1) toIndex = 0;

				var fromIndex = allKeys.indexOf(fromLocation.key);

				if (fromIndex === -1) fromIndex = 0;

				var delta = toIndex - fromIndex;

				if (delta) {
					forceNextPop = true;
					go(delta);
				}
			};

			var initialLocation = getDOMLocation(getHistoryState());
			var allKeys = [initialLocation.key];

			// Public interface

			var createHref = function createHref(location) {
				return basename + (0, PathUtils.createPath)(location);
			};

			var push = function push(path, state) {
				(0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

				var action = 'PUSH';
				var location = (0, LocationUtils.createLocation)(path, state, createKey(), history.location);

				transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
					if (!ok) return;

					var href = createHref(location);
					var key = location.key,
					    state = location.state;

					if (canUseHistory) {
						globalHistory.pushState({ key: key, state: state }, null, href);

						if (forceRefresh) {
							window.location.href = href;
						} else {
							var prevIndex = allKeys.indexOf(history.location.key);
							var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);

							nextKeys.push(location.key);
							allKeys = nextKeys;

							setState({ action: action, location: location });
						}
					} else {
						(0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');

						window.location.href = href;
					}
				});
			};

			var replace = function replace(path, state) {
				(0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');

				var action = 'REPLACE';
				var location = (0, LocationUtils.createLocation)(path, state, createKey(), history.location);

				transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
					if (!ok) return;

					var href = createHref(location);
					var key = location.key,
					    state = location.state;

					if (canUseHistory) {
						globalHistory.replaceState({ key: key, state: state }, null, href);

						if (forceRefresh) {
							window.location.replace(href);
						} else {
							var prevIndex = allKeys.indexOf(history.location.key);

							if (prevIndex !== -1) allKeys[prevIndex] = location.key;

							setState({ action: action, location: location });
						}
					} else {
						(0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');

						window.location.replace(href);
					}
				});
			};

			var go = function go(n) {
				globalHistory.go(n);
			};

			var goBack = function goBack() {
				return go(-1);
			};

			var goForward = function goForward() {
				return go(1);
			};

			var listenerCount = 0;

			var checkDOMListeners = function checkDOMListeners(delta) {
				listenerCount += delta;

				if (listenerCount === 1) {
					(0, DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

					if (needsHashChangeListener) (0, DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
				} else if (listenerCount === 0) {
					(0, DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

					if (needsHashChangeListener) (0, DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
				}
			};

			var isBlocked = false;

			var block = function block() {
				var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

				var unblock = transitionManager.setPrompt(prompt);

				if (!isBlocked) {
					checkDOMListeners(1);
					isBlocked = true;
				}

				return function () {
					if (isBlocked) {
						isBlocked = false;
						checkDOMListeners(-1);
					}

					return unblock();
				};
			};

			var listen = function listen(listener) {
				var unlisten = transitionManager.appendListener(listener);
				checkDOMListeners(1);

				return function () {
					checkDOMListeners(-1);
					unlisten();
				};
			};

			var history = {
				length: globalHistory.length,
				action: 'POP',
				location: initialLocation,
				createHref: createHref,
				push: push,
				replace: replace,
				go: go,
				goBack: goBack,
				goForward: goForward,
				block: block,
				listen: listen
			};

			return history;
		};

		exports.default = createBrowserHistory;
	});

	var createHistory = unwrapExports(createBrowserHistory_1);

	var history = createHistory();

	var compiledGrammar = createCommonjsModule(function (module, exports) {
		/* parser generated by jison 0.4.17 */
		/*
    Returns a Parser object of the following structure:
  
    Parser: {
      yy: {}
    }
  
    Parser.prototype: {
      yy: {},
      trace: function(),
      symbols_: {associative list: name ==> number},
      terminals_: {associative list: number ==> name},
      productions_: [...],
      performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
      table: [...],
      defaultActions: {...},
      parseError: function(str, hash),
      parse: function(input),
  
      lexer: {
          EOF: 1,
          parseError: function(str, hash),
          setInput: function(input),
          input: function(),
          unput: function(str),
          more: function(),
          less: function(n),
          pastInput: function(),
          upcomingInput: function(),
          showPosition: function(),
          test_match: function(regex_match_array, rule_index),
          next: function(),
          lex: function(),
          begin: function(condition),
          popState: function(),
          _currentRules: function(),
          topState: function(),
          pushState: function(condition),
  
          options: {
              ranges: boolean           (optional: true ==> token location info will include a .range[] member)
              flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
              backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
          },
  
          performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
          rules: [...],
          conditions: {associative list: name ==> set},
      }
    }
  
  
    token location info (@$, _$, etc.): {
      first_line: n,
      last_line: n,
      first_column: n,
      last_column: n,
      range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
    }
  
  
    the parseError function receives a 'hash' object with these members for lexer and parser errors: {
      text:        (matched text)
      token:       (the produced terminal token, if any)
      line:        (yylineno)
    }
    while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
      loc:         (yylloc)
      expected:    (string describing the set of expected tokens)
      recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
    }
  */
		var parser = function () {
			var o = function o(k, v, _o, l) {
				for (_o = _o || {}, l = k.length; l--; _o[k[l]] = v) {}return _o;
			},
			    $V0 = [1, 9],
			    $V1 = [1, 10],
			    $V2 = [1, 11],
			    $V3 = [1, 12],
			    $V4 = [5, 11, 12, 13, 14, 15];
			var parser = { trace: function trace() {},
				yy: {},
				symbols_: { "error": 2, "root": 3, "expressions": 4, "EOF": 5, "expression": 6, "optional": 7, "literal": 8, "splat": 9, "param": 10, "(": 11, ")": 12, "LITERAL": 13, "SPLAT": 14, "PARAM": 15, "$accept": 0, "$end": 1 },
				terminals_: { 2: "error", 5: "EOF", 11: "(", 12: ")", 13: "LITERAL", 14: "SPLAT", 15: "PARAM" },
				productions_: [0, [3, 2], [3, 1], [4, 2], [4, 1], [6, 1], [6, 1], [6, 1], [6, 1], [7, 3], [8, 1], [9, 1], [10, 1]],
				performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
					/* this == yyval */

					var $0 = $$.length - 1;
					switch (yystate) {
						case 1:
							return new yy.Root({}, [$$[$0 - 1]]);
							break;
						case 2:
							return new yy.Root({}, [new yy.Literal({ value: '' })]);
							break;
						case 3:
							this.$ = new yy.Concat({}, [$$[$0 - 1], $$[$0]]);
							break;
						case 4:case 5:
							this.$ = $$[$0];
							break;
						case 6:
							this.$ = new yy.Literal({ value: $$[$0] });
							break;
						case 7:
							this.$ = new yy.Splat({ name: $$[$0] });
							break;
						case 8:
							this.$ = new yy.Param({ name: $$[$0] });
							break;
						case 9:
							this.$ = new yy.Optional({}, [$$[$0 - 1]]);
							break;
						case 10:
							this.$ = yytext;
							break;
						case 11:case 12:
							this.$ = yytext.slice(1);
							break;
					}
				},
				table: [{ 3: 1, 4: 2, 5: [1, 3], 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: $V0, 13: $V1, 14: $V2, 15: $V3 }, { 1: [3] }, { 5: [1, 13], 6: 14, 7: 5, 8: 6, 9: 7, 10: 8, 11: $V0, 13: $V1, 14: $V2, 15: $V3 }, { 1: [2, 2] }, o($V4, [2, 4]), o($V4, [2, 5]), o($V4, [2, 6]), o($V4, [2, 7]), o($V4, [2, 8]), { 4: 15, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: $V0, 13: $V1, 14: $V2, 15: $V3 }, o($V4, [2, 10]), o($V4, [2, 11]), o($V4, [2, 12]), { 1: [2, 1] }, o($V4, [2, 3]), { 6: 14, 7: 5, 8: 6, 9: 7, 10: 8, 11: $V0, 12: [1, 16], 13: $V1, 14: $V2, 15: $V3 }, o($V4, [2, 9])],
				defaultActions: { 3: [2, 2], 13: [2, 1] },
				parseError: function parseError(str, hash) {
					if (hash.recoverable) {
						this.trace(str);
					} else {
						var _parseError = function _parseError(msg, hash) {
							this.message = msg;
							this.hash = hash;
						};

						_parseError.prototype = Error;

						throw new _parseError(str, hash);
					}
				},
				parse: function parse(input) {
					var self = this,
					    stack = [0],
					    tstack = [],
					    vstack = [null],
					    lstack = [],
					    table = this.table,
					    yytext = '',
					    yylineno = 0,
					    yyleng = 0,
					    recovering = 0,
					    TERROR = 2,
					    EOF = 1;
					var args = lstack.slice.call(arguments, 1);
					var lexer = Object.create(this.lexer);
					var sharedState = { yy: {} };
					for (var k in this.yy) {
						if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
							sharedState.yy[k] = this.yy[k];
						}
					}
					lexer.setInput(input, sharedState.yy);
					sharedState.yy.lexer = lexer;
					sharedState.yy.parser = this;
					if (typeof lexer.yylloc == 'undefined') {
						lexer.yylloc = {};
					}
					var yyloc = lexer.yylloc;
					lstack.push(yyloc);
					var ranges = lexer.options && lexer.options.ranges;
					if (typeof sharedState.yy.parseError === 'function') {
						this.parseError = sharedState.yy.parseError;
					} else {
						this.parseError = Object.getPrototypeOf(this).parseError;
					}
					_token_stack: var lex = function lex() {
						var token;
						token = lexer.lex() || EOF;
						if (typeof token !== 'number') {
							token = self.symbols_[token] || token;
						}
						return token;
					};
					var symbol,
					    preErrorSymbol,
					    state,
					    action,
					    a,
					    r,
					    yyval = {},
					    p,
					    len,
					    newState,
					    expected;
					while (true) {
						state = stack[stack.length - 1];
						if (this.defaultActions[state]) {
							action = this.defaultActions[state];
						} else {
							if (symbol === null || typeof symbol == 'undefined') {
								symbol = lex();
							}
							action = table[state] && table[state][symbol];
						}
						if (typeof action === 'undefined' || !action.length || !action[0]) {
							var errStr = '';
							expected = [];
							for (p in table[state]) {
								if (this.terminals_[p] && p > TERROR) {
									expected.push('\'' + this.terminals_[p] + '\'');
								}
							}
							if (lexer.showPosition) {
								errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
							} else {
								errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
							}
							this.parseError(errStr, {
								text: lexer.match,
								token: this.terminals_[symbol] || symbol,
								line: lexer.yylineno,
								loc: yyloc,
								expected: expected
							});
						}
						if (action[0] instanceof Array && action.length > 1) {
							throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
						}
						switch (action[0]) {
							case 1:
								stack.push(symbol);
								vstack.push(lexer.yytext);
								lstack.push(lexer.yylloc);
								stack.push(action[1]);
								symbol = null;
								if (!preErrorSymbol) {
									yyleng = lexer.yyleng;
									yytext = lexer.yytext;
									yylineno = lexer.yylineno;
									yyloc = lexer.yylloc;
								} else {
									symbol = preErrorSymbol;
									preErrorSymbol = null;
								}
								break;
							case 2:
								len = this.productions_[action[1]][1];
								yyval.$ = vstack[vstack.length - len];
								yyval._$ = {
									first_line: lstack[lstack.length - (len || 1)].first_line,
									last_line: lstack[lstack.length - 1].last_line,
									first_column: lstack[lstack.length - (len || 1)].first_column,
									last_column: lstack[lstack.length - 1].last_column
								};
								if (ranges) {
									yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
								}
								r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
								if (typeof r !== 'undefined') {
									return r;
								}
								if (len) {
									stack = stack.slice(0, -1 * len * 2);
									vstack = vstack.slice(0, -1 * len);
									lstack = lstack.slice(0, -1 * len);
								}
								stack.push(this.productions_[action[1]][0]);
								vstack.push(yyval.$);
								lstack.push(yyval._$);
								newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
								stack.push(newState);
								break;
							case 3:
								return true;
						}
					}
					return true;
				} };
			/* generated by jison-lex 0.3.4 */
			var lexer = function () {
				var lexer = {

					EOF: 1,

					parseError: function parseError(str, hash) {
						if (this.yy.parser) {
							this.yy.parser.parseError(str, hash);
						} else {
							throw new Error(str);
						}
					},

					// resets the lexer, sets new input
					setInput: function setInput(input, yy) {
						this.yy = yy || this.yy || {};
						this._input = input;
						this._more = this._backtrack = this.done = false;
						this.yylineno = this.yyleng = 0;
						this.yytext = this.matched = this.match = '';
						this.conditionStack = ['INITIAL'];
						this.yylloc = {
							first_line: 1,
							first_column: 0,
							last_line: 1,
							last_column: 0
						};
						if (this.options.ranges) {
							this.yylloc.range = [0, 0];
						}
						this.offset = 0;
						return this;
					},

					// consumes and returns one char from the input
					input: function input() {
						var ch = this._input[0];
						this.yytext += ch;
						this.yyleng++;
						this.offset++;
						this.match += ch;
						this.matched += ch;
						var lines = ch.match(/(?:\r\n?|\n).*/g);
						if (lines) {
							this.yylineno++;
							this.yylloc.last_line++;
						} else {
							this.yylloc.last_column++;
						}
						if (this.options.ranges) {
							this.yylloc.range[1]++;
						}

						this._input = this._input.slice(1);
						return ch;
					},

					// unshifts one char (or a string) into the input
					unput: function unput(ch) {
						var len = ch.length;
						var lines = ch.split(/(?:\r\n?|\n)/g);

						this._input = ch + this._input;
						this.yytext = this.yytext.substr(0, this.yytext.length - len);
						//this.yyleng -= len;
						this.offset -= len;
						var oldLines = this.match.split(/(?:\r\n?|\n)/g);
						this.match = this.match.substr(0, this.match.length - 1);
						this.matched = this.matched.substr(0, this.matched.length - 1);

						if (lines.length - 1) {
							this.yylineno -= lines.length - 1;
						}
						var r = this.yylloc.range;

						this.yylloc = {
							first_line: this.yylloc.first_line,
							last_line: this.yylineno + 1,
							first_column: this.yylloc.first_column,
							last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
						};

						if (this.options.ranges) {
							this.yylloc.range = [r[0], r[0] + this.yyleng - len];
						}
						this.yyleng = this.yytext.length;
						return this;
					},

					// When called from action, caches matched text and appends it on next action
					more: function more() {
						this._more = true;
						return this;
					},

					// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
					reject: function reject() {
						if (this.options.backtrack_lexer) {
							this._backtrack = true;
						} else {
							return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
								text: "",
								token: null,
								line: this.yylineno
							});
						}
						return this;
					},

					// retain first n characters of the match
					less: function less(n) {
						this.unput(this.match.slice(n));
					},

					// displays already matched input, i.e. for error messages
					pastInput: function pastInput() {
						var past = this.matched.substr(0, this.matched.length - this.match.length);
						return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, "");
					},

					// displays upcoming input, i.e. for error messages
					upcomingInput: function upcomingInput() {
						var next = this.match;
						if (next.length < 20) {
							next += this._input.substr(0, 20 - next.length);
						}
						return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
					},

					// displays the character position where the lexing error occurred, i.e. for error messages
					showPosition: function showPosition() {
						var pre = this.pastInput();
						var c = new Array(pre.length + 1).join("-");
						return pre + this.upcomingInput() + "\n" + c + "^";
					},

					// test the lexed token: return FALSE when not a match, otherwise return token
					test_match: function test_match(match, indexed_rule) {
						var token, lines, backup;

						if (this.options.backtrack_lexer) {
							// save context
							backup = {
								yylineno: this.yylineno,
								yylloc: {
									first_line: this.yylloc.first_line,
									last_line: this.last_line,
									first_column: this.yylloc.first_column,
									last_column: this.yylloc.last_column
								},
								yytext: this.yytext,
								match: this.match,
								matches: this.matches,
								matched: this.matched,
								yyleng: this.yyleng,
								offset: this.offset,
								_more: this._more,
								_input: this._input,
								yy: this.yy,
								conditionStack: this.conditionStack.slice(0),
								done: this.done
							};
							if (this.options.ranges) {
								backup.yylloc.range = this.yylloc.range.slice(0);
							}
						}

						lines = match[0].match(/(?:\r\n?|\n).*/g);
						if (lines) {
							this.yylineno += lines.length;
						}
						this.yylloc = {
							first_line: this.yylloc.last_line,
							last_line: this.yylineno + 1,
							first_column: this.yylloc.last_column,
							last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
						};
						this.yytext += match[0];
						this.match += match[0];
						this.matches = match;
						this.yyleng = this.yytext.length;
						if (this.options.ranges) {
							this.yylloc.range = [this.offset, this.offset += this.yyleng];
						}
						this._more = false;
						this._backtrack = false;
						this._input = this._input.slice(match[0].length);
						this.matched += match[0];
						token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
						if (this.done && this._input) {
							this.done = false;
						}
						if (token) {
							return token;
						} else if (this._backtrack) {
							// recover context
							for (var k in backup) {
								this[k] = backup[k];
							}
							return false; // rule action called reject() implying the next rule should be tested instead.
						}
						return false;
					},

					// return next match in input
					next: function next() {
						if (this.done) {
							return this.EOF;
						}
						if (!this._input) {
							this.done = true;
						}

						var token, match, tempMatch, index;
						if (!this._more) {
							this.yytext = '';
							this.match = '';
						}
						var rules = this._currentRules();
						for (var i = 0; i < rules.length; i++) {
							tempMatch = this._input.match(this.rules[rules[i]]);
							if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
								match = tempMatch;
								index = i;
								if (this.options.backtrack_lexer) {
									token = this.test_match(tempMatch, rules[i]);
									if (token !== false) {
										return token;
									} else if (this._backtrack) {
										match = false;
										continue; // rule action called reject() implying a rule MISmatch.
									} else {
										// else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
										return false;
									}
								} else if (!this.options.flex) {
									break;
								}
							}
						}
						if (match) {
							token = this.test_match(match, rules[index]);
							if (token !== false) {
								return token;
							}
							// else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
							return false;
						}
						if (this._input === "") {
							return this.EOF;
						} else {
							return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
								text: "",
								token: null,
								line: this.yylineno
							});
						}
					},

					// return next match that has a token
					lex: function lex() {
						var r = this.next();
						if (r) {
							return r;
						} else {
							return this.lex();
						}
					},

					// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
					begin: function begin(condition) {
						this.conditionStack.push(condition);
					},

					// pop the previously active lexer condition state off the condition stack
					popState: function popState() {
						var n = this.conditionStack.length - 1;
						if (n > 0) {
							return this.conditionStack.pop();
						} else {
							return this.conditionStack[0];
						}
					},

					// produce the lexer rule set which is active for the currently active lexer condition state
					_currentRules: function _currentRules() {
						if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
							return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
						} else {
							return this.conditions["INITIAL"].rules;
						}
					},

					// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
					topState: function topState(n) {
						n = this.conditionStack.length - 1 - Math.abs(n || 0);
						if (n >= 0) {
							return this.conditionStack[n];
						} else {
							return "INITIAL";
						}
					},

					// alias for begin(condition)
					pushState: function pushState(condition) {
						this.begin(condition);
					},

					// return the number of states currently on the stack
					stateStackSize: function stateStackSize() {
						return this.conditionStack.length;
					},
					options: {},
					performAction: function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
						switch ($avoiding_name_collisions) {
							case 0:
								return "(";
								break;
							case 1:
								return ")";
								break;
							case 2:
								return "SPLAT";
								break;
							case 3:
								return "PARAM";
								break;
							case 4:
								return "LITERAL";
								break;
							case 5:
								return "LITERAL";
								break;
							case 6:
								return "EOF";
								break;
						}
					},
					rules: [/^(?:\()/, /^(?:\))/, /^(?:\*+\w+)/, /^(?::+\w+)/, /^(?:[\w%\-~\n]+)/, /^(?:.)/, /^(?:$)/],
					conditions: { "INITIAL": { "rules": [0, 1, 2, 3, 4, 5, 6], "inclusive": true } }
				};
				return lexer;
			}();
			parser.lexer = lexer;
			function Parser() {
				this.yy = {};
			}
			Parser.prototype = parser;parser.Parser = Parser;
			return new Parser();
		}();

		if (typeof commonjsRequire !== 'undefined' && 'object' !== 'undefined') {
			exports.parser = parser;
			exports.Parser = parser.Parser;
			exports.parse = function () {
				return parser.parse.apply(parser, arguments);
			};
		}
	});

	var compiledGrammar_1 = compiledGrammar.parser;
	var compiledGrammar_2 = compiledGrammar.Parser;
	var compiledGrammar_3 = compiledGrammar.parse;

	function createNode(displayName) {
		return function (props, children) {
			return {
				displayName: displayName,
				props: props,
				children: children || []
			};
		};
	}

	var nodes = {
		Root: createNode('Root'),
		Concat: createNode('Concat'),
		Literal: createNode('Literal'),
		Splat: createNode('Splat'),
		Param: createNode('Param'),
		Optional: createNode('Optional')
	};

	var parser = compiledGrammar.parser;
	parser.yy = nodes;
	var parser_1 = parser;

	var nodeTypes = Object.keys(nodes);

	/**
  * Helper for creating visitors. Take an object of node name to handler
  * mappings, returns an object with a "visit" method that can be called
  * @param  {Object.<string,function(node,context)>} handlers A mapping of node
  * type to visitor functions
  * @return {{visit: function(node,context)}}  A visitor object with a "visit"
  * method that can be called on a node with a context
  */
	function createVisitor(handlers) {
		nodeTypes.forEach(function (nodeType) {
			if (typeof handlers[nodeType] === 'undefined') {
				throw new Error('No handler defined for ' + nodeType.displayName);
			}
		});

		return {
			/**
    * Call the given handler for this node type
    * @param  {Object} node    the AST node
    * @param  {Object} context context to pass through to handlers
    * @return {Object}
    */
			visit: function visit(node, context) {
				return this.handlers[node.displayName].call(this, node, context);
			},
			handlers: handlers
		};
	}

	var create_visitor = createVisitor;

	var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	/**
  * @class
  * @private
  */
	function Matcher(options) {
		this.captures = options.captures;
		this.re = options.re;
	}

	/**
  * Try matching a path against the generated regular expression
  * @param  {String} path The path to try to match
  * @return {Object|false}      matched parameters or false
  */
	Matcher.prototype.match = function (path) {
		var match = this.re.exec(path),
		    matchParams = {};

		if (!match) {
			return;
		}

		this.captures.forEach(function (capture, i) {
			if (typeof match[i + 1] === 'undefined') {
				matchParams[capture] = undefined;
			} else {
				matchParams[capture] = decodeURIComponent(match[i + 1]);
			}
		});

		return matchParams;
	};

	/**
  * Visitor for the AST to create a regular expression matcher
  * @class RegexpVisitor
  * @borrows Visitor-visit
  */
	var RegexpVisitor = create_visitor({
		'Concat': function Concat(node) {
			return node.children.reduce(function (memo, child) {
				var childResult = this.visit(child);
				return {
					re: memo.re + childResult.re,
					captures: memo.captures.concat(childResult.captures)
				};
			}.bind(this), { re: '', captures: [] });
		},
		'Literal': function Literal(node) {
			return {
				re: node.props.value.replace(escapeRegExp, '\\$&'),
				captures: []
			};
		},

		'Splat': function Splat(node) {
			return {
				re: '([^?]*?)',
				captures: [node.props.name]
			};
		},

		'Param': function Param(node) {
			return {
				re: '([^\\/\\?]+)',
				captures: [node.props.name]
			};
		},

		'Optional': function Optional(node) {
			var child = this.visit(node.children[0]);
			return {
				re: '(?:' + child.re + ')?',
				captures: child.captures
			};
		},

		'Root': function Root(node) {
			var childResult = this.visit(node.children[0]);
			return new Matcher({
				re: new RegExp('^' + childResult.re + '(?=\\?|$)'),
				captures: childResult.captures
			});
		}
	});

	var regexp = RegexpVisitor;

	var ReverseVisitor = create_visitor({
		'Concat': function Concat(node, context) {
			var childResults = node.children.map(function (child) {
				return this.visit(child, context);
			}.bind(this));

			if (childResults.some(function (c) {
				return c === false;
			})) {
				return false;
			} else {
				return childResults.join('');
			}
		},

		'Literal': function Literal(node) {
			return decodeURI(node.props.value);
		},

		'Splat': function Splat(node, context) {
			if (context[node.props.name]) {
				return context[node.props.name];
			} else {
				return false;
			}
		},

		'Param': function Param(node, context) {
			if (context[node.props.name]) {
				return context[node.props.name];
			} else {
				return false;
			}
		},

		'Optional': function Optional(node, context) {
			var childResult = this.visit(node.children[0], context);
			if (childResult) {
				return childResult;
			} else {
				return '';
			}
		},

		'Root': function Root(node, context) {
			context = context || {};
			var childResult = this.visit(node.children[0], context);
			if (!childResult) {
				return false;
			}
			return encodeURI(childResult);
		}
	});

	var reverse = ReverseVisitor;

	Route.prototype = Object.create(null);

	/**
  * Match a path against this route, returning the matched parameters if
  * it matches, false if not.
  * @example
  * var route = new Route('/this/is/my/route')
  * route.match('/this/is/my/route') // -> {}
  * @example
  * var route = new Route('/:one/:two')
  * route.match('/foo/bar/') // -> {one: 'foo', two: 'bar'}
  * @param  {string} path the path to match this route against
  * @return {(Object.<string,string>|false)} A map of the matched route
  * parameters, or false if matching failed
  */
	Route.prototype.match = function (path) {
		var re = regexp.visit(this.ast),
		    matched = re.match(path);

		return matched ? matched : false;
	};

	/**
  * Reverse a route specification to a path, returning false if it can't be
  * fulfilled
  * @example
  * var route = new Route('/:one/:two')
  * route.reverse({one: 'foo', two: 'bar'}) -> '/foo/bar'
  * @param  {Object} params The parameters to fill in
  * @return {(String|false)} The filled in path
  */
	Route.prototype.reverse = function (params) {
		return reverse.visit(this.ast, params);
	};

	/**
  * Represents a route
  * @example
  * var route = Route('/:foo/:bar');
  * @example
  * var route = Route('/:foo/:bar');
  * @param {string} spec -  the string specification of the route.
  *     use :param for single portion captures, *param for splat style captures,
  *     and () for optional route branches
  * @constructor
  */
	function Route(spec) {
		var route;
		if (this) {
			// constructor called with new
			route = this;
		} else {
			// constructor called as a function
			route = Object.create(Route.prototype);
		}
		if (typeof spec === 'undefined') {
			throw new Error('A route spec is required');
		}
		route.spec = spec;
		route.ast = parser_1.parse(spec);
		return route;
	}

	var route = Route;

	var routeParser = route;

	var createRouter = function createRouter(routes) {
		var content = void 0;
		var unlisten = void 0;
		var target = void 0;

		var createRouteBehavior = function createRouteBehavior(route) {
			if (typeof route === 'function') {
				return function (input) {
					return content = new route(input);
				};
			}

			if ((typeof route === 'undefined' ? 'undefined' : _typeof2(route)) === 'object') {
				if (route.redirect) {
					return function () {
						return history.push(route.redirect);
					};
				}
			}

			if (typeof route === 'string') {
				return function () {
					return history.push(route);
				};
			}

			return function () {};
		};

		var routeData = Object.keys(routes).map(function (key) {
			return [key, routes[key]];
		}).map(function (_ref2) {
			var _ref3 = _slicedToArray(_ref2, 2),
			    key = _ref3[0],
			    value = _ref3[1];

			return {
				route: new routeParser(key),
				behavior: createRouteBehavior(value)
			};
		});

		var handleRouteChange = function handleRouteChange(location) {
			if (content && content.teardown) content.teardown();

			for (var i = 0; i < routeData.length; i += 1) {
				var _data = routeData[i].route.match(location.pathname);
				if (_data) {
					routeData[i].behavior({ target: target, data: _data });

					break;
				}
			}
		};

		return {
			start: function start(location, targetElement) {
				target = targetElement;
				unlisten = history.listen(handleRouteChange);
				handleRouteChange(location);
			},
			teardown: function teardown() {
				if (unlisten) {
					unlisten();
					unlisten = undefined;
				}
			}
		};
	};

	var cache = {};
	cache.applications = {};
	cache.services = {};
	cache.insights = {};

	function getApplication(id) {
		return fetch('/api/application/' + id).then(function (res) {
			return res.json();
		}).then(function (json) {
			cache.applications[json.value.id] = json.value;
			return json.value;
		});
	}

	function getApplications() {
		return fetch('/api/applications').then(function (res) {
			return res.json();
		}).then(function (json) {

			json.value.map(function (app) {
				console.log('id', app.id);
				cache.applications[app.id] = app;
			});

			return json;
		});
	}

	function getServices() {
		return fetch('/api/services').then(function (res) {
			return res.json();
		}).then(function (json) {

			json.value.map(function (service) {
				cache.services[service.id] = service;
			});

			return json;
		});
	}

	function getInsights() {
		return fetch('/api/insights').then(function (res) {
			return res.json();
		});
	}

	function getInsightsFor(application) {
		return getInsights().then(function (json) {
			var value = json.value;
			return value.find(function (insight) {
				return insight.service.id = application;
			});
		});
	}

	function buildApplicationInsights() {
		console.log('buildApplicationInsights');

		var services = getServices();
		var applications = getApplications();
		var insights = getInsights();

		return new Promise(function (resolve, reject) {
			Promise.all([services, applications, insights]).then(function (_ref4) {
				var _ref5 = _slicedToArray(_ref4, 3),
				    services = _ref5[0],
				    applications = _ref5[1],
				    insights = _ref5[2];

				services = services.value;
				applications = applications.value;
				insights = insights.value;

				services.map(function (service) {
					applications.map(function (application) {
						if (application.id === service.application) {
							application.service = service;

							insights.map(function (insight) {
								if (insight.service.id === service.id) {
									application.insights = insight;
								}
							});
						}
					});
				});

				resolve(applications);
			});
		});
	}

	var api = {
		cache: cache,
		getInsights: getInsights,
		getApplication: getApplication,
		getApplications: getApplications,
		getInsightsFor: getInsightsFor,
		getServices: getServices,
		buildApplicationInsights: buildApplicationInsights
	};

	/* modules/server/app/components/Link.html generated by Svelte v1.54.2 */
	function data() {
		return {
			text: '',
			to: '/'
		};
	}

	var methods = {
		navigate: function navigate(evt, path) {
			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
			if (path) {
				history.push(path);
			}
		}
	};

	function create_main_fragment(state, component) {
		var a, text;

		function click_handler(event) {
			var state = component.get();
			component.navigate(event, state.to);
		}

		return {
			c: function create() {
				a = createElement("a");
				text = createText(state.text);
				this.h();
			},

			h: function hydrate() {
				a.href = "#";
				addListener(a, "click", click_handler);
			},

			m: function mount(target, anchor) {
				insertNode(a, target, anchor);
				appendNode(text, a);
			},

			p: function update(changed, state) {
				if (changed.text) {
					text.data = state.text;
				}
			},

			u: function unmount() {
				detachNode(a);
			},

			d: function destroy$$1() {
				removeListener(a, "click", click_handler);
			}
		};
	}

	function Link(options) {
		init(this, options);
		this._state = assign(data(), options.data);

		this._fragment = create_main_fragment(this._state, this);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);
		}
	}

	assign(Link.prototype, methods, proto);

	/* modules/server/app/components/Footer.html generated by Svelte v1.54.2 */
	function create_main_fragment$1(state, component) {
		var footer;

		return {
			c: function create() {
				footer = createElement("footer");
				footer.textContent = "Copyright 2016";
			},

			m: function mount(target, anchor) {
				insertNode(footer, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(footer);
			},

			d: noop
		};
	}

	function Footer(options) {
		init(this, options);
		this._state = assign({}, options.data);

		this._fragment = create_main_fragment$1(this._state, this);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);
		}
	}

	assign(Footer.prototype, proto);

	/* modules/server/app/components/Header.html generated by Svelte v1.54.2 */
	function create_main_fragment$2(state, component) {
		var header;

		return {
			c: function create() {
				header = createElement("header");
				header.innerHTML = "<a href=\"/\"><img class=\"logo\" src=\"/img/logo.svg\" alt=\"OKKO\"></a>";
			},

			m: function mount(target, anchor) {
				insertNode(header, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(header);
			},

			d: noop
		};
	}

	function Header(options) {
		init(this, options);
		this._state = assign({}, options.data);

		this._fragment = create_main_fragment$2(this._state, this);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);
		}
	}

	assign(Header.prototype, proto);

	function Store(state) {
		this._observers = { pre: blankObject(), post: blankObject() };
		this._changeHandlers = [];
		this._dependents = [];

		this._computed = blankObject();
		this._sortedComputedProperties = [];

		this._state = assign({}, state);
	}

	assign(Store.prototype, {
		_add: function _add(component, props) {
			this._dependents.push({
				component: component,
				props: props
			});
		},

		_init: function _init(props) {
			var state = {};
			for (var i = 0; i < props.length; i += 1) {
				var prop = props[i];
				state['$' + prop] = this._state[prop];
			}
			return state;
		},

		_remove: function _remove(component) {
			var i = this._dependents.length;
			while (i--) {
				if (this._dependents[i].component === component) {
					this._dependents.splice(i, 1);
					return;
				}
			}
		},

		_sortComputedProperties: function _sortComputedProperties() {
			var computed = this._computed;
			var sorted = this._sortedComputedProperties = [];
			var cycles;
			var visited = blankObject();

			function visit(key) {
				if (cycles[key]) {
					throw new Error('Cyclical dependency detected');
				}

				if (visited[key]) return;
				visited[key] = true;

				var c = computed[key];

				if (c) {
					cycles[key] = true;
					c.deps.forEach(visit);
					sorted.push(c);
				}
			}

			for (var key in this._computed) {
				cycles = blankObject();
				visit(key);
			}
		},

		compute: function compute(key, deps, fn) {
			var value;

			var c = {
				deps: deps,
				update: function update(state, changed, dirty) {
					var values = deps.map(function (dep) {
						if (dep in changed) dirty = true;
						return state[dep];
					});

					if (dirty) {
						var newValue = fn.apply(null, values);
						if (differs(newValue, value)) {
							value = newValue;
							changed[key] = true;
							state[key] = value;
						}
					}
				}
			};

			c.update(this._state, {}, true);

			this._computed[key] = c;
			this._sortComputedProperties();
		},

		get: get,

		observe: observe,

		onchange: function onchange(callback) {
			this._changeHandlers.push(callback);
			return {
				cancel: function cancel() {
					var index = this._changeHandlers.indexOf(callback);
					if (~index) this._changeHandlers.splice(index, 1);
				}
			};
		},

		set: function set(newState) {
			var oldState = this._state,
			    changed = this._changed = {},
			    dirty = false;

			for (var key in newState) {
				if (this._computed[key]) throw new Error("'" + key + "' is a read-only property");
				if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
			}
			if (!dirty) return;

			this._state = assign({}, oldState, newState);

			for (var i = 0; i < this._sortedComputedProperties.length; i += 1) {
				this._sortedComputedProperties[i].update(this._state, changed);
			}

			for (var i = 0; i < this._changeHandlers.length; i += 1) {
				this._changeHandlers[i](this._state, changed);
			}

			dispatchObservers(this, this._observers.pre, changed, this._state, oldState);

			var dependents = this._dependents.slice(); // guard against mutations
			for (var i = 0; i < dependents.length; i += 1) {
				var dependent = dependents[i];
				var componentState = {};
				dirty = false;

				for (var j = 0; j < dependent.props.length; j += 1) {
					var prop = dependent.props[j];
					if (prop in changed) {
						componentState['$' + prop] = this._state[prop];
						dirty = true;
					}
				}

				if (dirty) dependent.component.set(componentState);
			}

			dispatchObservers(this, this._observers.post, changed, this._state, oldState);
		}
	});

	var RootStore = function (_Store) {
		_inherits(RootStore, _Store);

		function RootStore() {
			_classCallCheck(this, RootStore);

			return _possibleConstructorReturn(this, (RootStore.__proto__ || Object.getPrototypeOf(RootStore)).apply(this, arguments));
		}

		_createClass(RootStore, [{
			key: 'setApplications',
			value: function setApplications(applications) {
				this.set({ applications: applications });
			}
		}]);

		return RootStore;
	}(Store);

	var _store = new RootStore({
		online: 0,
		offline: 0,
		applications: [],
		application: {}
	});

	/* modules/server/app/components/ApplicationListItem.html generated by Svelte v1.54.2 */
	function status(online) {
		return online ? 'online' : 'offline';
	}

	function data$1() {
		return {
			item: {
				status: '',
				appId: '',
				last24Hours: 0,
				lastWeek: 0,
				downtime: 0,
				outages: 0
			}
		};
	}

	function getStatus(online) {
		return online ? 'online' : 'offline';
	}

	function formatDowntime(downtime) {
		function pad(n, z) {
			z = z || 2;
			return ('00' + n).slice(-z);
		}

		var ms = downtime % 1000;
		downtime = (downtime - ms) / 1000;
		var secs = downtime % 60;
		downtime = (downtime - secs) / 60;
		var mins = downtime % 60;
		var hrs = (downtime - mins) / 60;

		return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
	}

	var methods$1 = {
		action: function action(event, _action) {
			if (event && event.preventDefault) {
				event.preventDefault();
			}

			switch (_action) {
				case 'edit':
					var appid = this.get('item').id;
					history.push('/application/' + appid + '/edit');
					break;
			}
		}
	};

	function oncreate() {
		console.log('oncreate: application list item');
		// this.observe('item', item => {
		//     console.log('item', item);
		// });
	}

	function create_main_fragment$3(state, component) {
		var tr,
		    td,
		    text_1,
		    td_1,
		    text_3,
		    td_2,
		    text_5,
		    td_3,
		    text_6_value = state.item.insights.status.last24Hours.uptime,
		    text_6,
		    text_7,
		    td_4,
		    text_8_value = state.item.insights.status.lastWeek.uptime,
		    text_8,
		    text_9,
		    td_5,
		    text_10_value = formatDowntime(state.item.insights.status.lastWeek.downtime),
		    text_10,
		    text_11,
		    td_6,
		    text_12_value = state.item.insights.status.lastWeek.numberOutages,
		    text_12,
		    text_13,
		    td_7,
		    button,
		    button_class_value,
		    text_15,
		    nav,
		    ul,
		    li,
		    li_1,
		    li_2,
		    tr_data_status_value;

		var link = new Link({
			root: component.root,
			data: {
				to: "/application/" + state.item.id,
				text: state.item.appId
			}
		});

		function click_handler(event) {
			component.set({ dropdown: 'active' });
		}

		function click_handler_1(event) {
			component.action(event, 'delete');
		}

		function click_handler_2(event) {
			component.action(event, 'edit');
		}

		function click_handler_3(event) {
			component.action(event, 'pause');
		}

		return {
			c: function create() {
				tr = createElement("tr");
				td = createElement("td");
				td.innerHTML = "<span class=\"icon-status\"></span>";
				text_1 = createText("\n    ");
				td_1 = createElement("td");
				link._fragment.c();
				text_3 = createText("\n\n    ");
				td_2 = createElement("td");
				td_2.innerHTML = "<span class=\"tag tag-status tag-big\"></span>";
				text_5 = createText("\n\n    ");
				td_3 = createElement("td");
				text_6 = createText(text_6_value);
				text_7 = createText("\n    ");
				td_4 = createElement("td");
				text_8 = createText(text_8_value);
				text_9 = createText("\n    ");
				td_5 = createElement("td");
				text_10 = createText(text_10_value);
				text_11 = createText("\n    ");
				td_6 = createElement("td");
				text_12 = createText(text_12_value);
				text_13 = createText("\n\n    ");
				td_7 = createElement("td");
				button = createElement("button");
				button.innerHTML = "<span class=\"icon-more\"></span>";
				text_15 = createText("\n        ");
				nav = createElement("nav");
				ul = createElement("ul");
				li = createElement("li");
				li.innerHTML = "<a href=\"#\"><span class=\"icon-delete\"></span>Delete</a>";
				li_1 = createElement("li");
				li_1.innerHTML = "<a href=\"#\"><span class=\"icon-edit\"></span>Edit</a>";
				li_2 = createElement("li");
				li_2.innerHTML = "<a href=\"#\"><span class=\"icon-pause\"></span>Pause Monitor</a>";
				this.h();
			},

			h: function hydrate() {
				td.className = "td-tight";
				td_3.className = "percentage";
				td_4.className = "percentage";
				button.className = button_class_value = "btn btn-icon dropdown-toggle " + state.dropdown;
				setAttribute(button, "role", "button");
				addListener(button, "click", click_handler);
				li.className = "container-icon";
				addListener(li, "click", click_handler_1);
				li_1.className = "container-icon";
				addListener(li_1, "click", click_handler_2);
				li_2.className = "container-icon";
				addListener(li_2, "click", click_handler_3);
				nav.className = "dropdown-menu dm-overlay dm-white";
				td_7.className = "dropdown-container td-center";
				tr.dataset.status = tr_data_status_value = getStatus(state.item.online);
			},

			m: function mount(target, anchor) {
				insertNode(tr, target, anchor);
				appendNode(td, tr);
				appendNode(text_1, tr);
				appendNode(td_1, tr);
				link._mount(td_1, null);
				appendNode(text_3, tr);
				appendNode(td_2, tr);
				appendNode(text_5, tr);
				appendNode(td_3, tr);
				appendNode(text_6, td_3);
				appendNode(text_7, tr);
				appendNode(td_4, tr);
				appendNode(text_8, td_4);
				appendNode(text_9, tr);
				appendNode(td_5, tr);
				appendNode(text_10, td_5);
				appendNode(text_11, tr);
				appendNode(td_6, tr);
				appendNode(text_12, td_6);
				appendNode(text_13, tr);
				appendNode(td_7, tr);
				appendNode(button, td_7);
				appendNode(text_15, td_7);
				appendNode(nav, td_7);
				appendNode(ul, nav);
				appendNode(li, ul);
				appendNode(li_1, ul);
				appendNode(li_2, ul);
			},

			p: function update(changed, state) {
				var link_changes = {};
				if (changed.item) link_changes.to = "/application/" + state.item.id;
				if (changed.item) link_changes.text = state.item.appId;
				link._set(link_changes);

				if (changed.item && text_6_value !== (text_6_value = state.item.insights.status.last24Hours.uptime)) {
					text_6.data = text_6_value;
				}

				if (changed.item && text_8_value !== (text_8_value = state.item.insights.status.lastWeek.uptime)) {
					text_8.data = text_8_value;
				}

				if (changed.item && text_10_value !== (text_10_value = formatDowntime(state.item.insights.status.lastWeek.downtime))) {
					text_10.data = text_10_value;
				}

				if (changed.item && text_12_value !== (text_12_value = state.item.insights.status.lastWeek.numberOutages)) {
					text_12.data = text_12_value;
				}

				if (changed.dropdown && button_class_value !== (button_class_value = "btn btn-icon dropdown-toggle " + state.dropdown)) {
					button.className = button_class_value;
				}

				if (changed.item && tr_data_status_value !== (tr_data_status_value = getStatus(state.item.online))) {
					tr.dataset.status = tr_data_status_value;
				}
			},

			u: function unmount() {
				detachNode(tr);
			},

			d: function destroy$$1() {
				link.destroy(false);
				removeListener(button, "click", click_handler);
				removeListener(li, "click", click_handler_1);
				removeListener(li_1, "click", click_handler_2);
				removeListener(li_2, "click", click_handler_3);
			}
		};
	}

	function ApplicationListItem(options) {
		init(this, options);
		this._state = assign(data$1(), options.data);
		this._recompute({ online: 1 }, this._state);

		var _oncreate = oncreate.bind(this);

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$3(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(ApplicationListItem.prototype, methods$1, proto);

	ApplicationListItem.prototype._recompute = function _recompute(changed, state) {
		if (changed.online) {
			if (differs(state.status, state.status = status(state.online))) changed.status = true;
		}
	};

	/* modules/server/app/components/Button.html generated by Svelte v1.54.2 */
	function data$2() {
		return {
			text: '',
			to: '/'
		};
	}

	function icon(type) {
		switch (type) {
			case 'add':
				return 'icon-plus';
				break;
			case 'edit':
				return 'icon-edit-white';
				break;
		}
	}

	var methods$2 = {
		navigate: function navigate(evt, path) {
			if (evt && evt.preventDefault) {
				evt.preventDefault();
			}
			if (path) {
				history.push(path);
			}
		}
	};

	function create_main_fragment$4(state, component) {
		var button, span, span_class_value, text, span_1, text_1;

		function click_handler(event) {
			var state = component.get();
			component.navigate(event, state.to);
		}

		return {
			c: function create() {
				button = createElement("button");
				span = createElement("span");
				text = createText("\n    ");
				span_1 = createElement("span");
				text_1 = createText(state.text);
				this.h();
			},

			h: function hydrate() {
				span.className = span_class_value = icon(state.type);
				setAttribute(span, "aria-hidden", "true");
				button.className = "btn btn-info";
				setAttribute(button, "role", "button");
				addListener(button, "click", click_handler);
			},

			m: function mount(target, anchor) {
				insertNode(button, target, anchor);
				appendNode(span, button);
				appendNode(text, button);
				appendNode(span_1, button);
				appendNode(text_1, span_1);
			},

			p: function update(changed, state) {
				if (changed.type && span_class_value !== (span_class_value = icon(state.type))) {
					span.className = span_class_value;
				}

				if (changed.text) {
					text_1.data = state.text;
				}
			},

			u: function unmount() {
				detachNode(button);
			},

			d: function destroy$$1() {
				removeListener(button, "click", click_handler);
			}
		};
	}

	function Button(options) {
		init(this, options);
		this._state = assign(data$2(), options.data);

		this._fragment = create_main_fragment$4(this._state, this);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);
		}
	}

	assign(Button.prototype, methods$2, proto);

	var EVENT_TYPES = {
		REQUEST_INSIGHTS: 'REQUEST_INSIGHTS',
		REQUEST_SERVICES: 'REQUEST_SERVICES',
		REQUEST_APPLICATION_ID: 'REQUEST_APPLICATION_ID',
		REQUEST_APPLICATIONS: 'REQUEST_APPLICATIONS',
		REQUEST_INSIGHT_ID: 'REQUEST_INSIGHT_ID',
		/**
   * Build all data to be displayed in home
   * page.
   */
		REQUEST_COMPILE_DATA: 'REQUEST_COMPILE_DATA',

		NAVIGATION_GOTO: 'NAVIGATION_GOTO',

		APPLICATION_NEW: 'APPLICATION_NEW',
		APPLICATION_VIEW: 'APPLICATION_VIEW',
		APPLICATION_EDIT: 'APPLICATION_EDIT'
	};

	var _handlers = {};

	var bus = {

		EVENT_TYPES: EVENT_TYPES,

		handle: function handle(eventName, handler) {

			if (arguments.length === 1) {
				handler = eventName.handler;
				eventName = eventName.type;
			}

			var handlers = _handlers[eventName] || (_handlers[eventName] = []);
			handlers.push(handler);

			return {
				cancel: function cancel() {
					var index = handlers.indexOf(handler);
					if (~index) handlers.splice(index, 1);
				}
			};
		},
		dispatch: function dispatch(eventName) {
			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


			if ((typeof eventName === 'undefined' ? 'undefined' : _typeof2(eventName)) === 'object') {
				data = eventName;
				eventName = data.type;
			} else if (!data.type) {
				data.type = eventName;
			}

			var handlers = eventName in _handlers && _handlers[eventName].slice();

			if (!handlers) {
				return console.log('No handlers for %s', eventName);
			}

			for (var i = 0; i < handlers.length; i += 1) {
				handlers[i].call(this, data);
			}
		},
		cancel: function cancel(eventName, handler) {

			if (arguments.length === 1) {
				handler = eventName.handler;
				eventName = eventName.type;
			}

			var handlers = _handlers[eventName] || (_handlers[eventName] = []);
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};

	/* modules/server/app/pages/Home.html generated by Svelte v1.54.2 */
	function data$3() {
		return {
			online: 0,
			offline: 0,
			applications: []
		};
	}

	var methods$3 = {
		addApplication: function addApplication() {
			console.log('message');
		}
	};

	function oncreate$1() {
		bus.requestCompiledData();
		window.page = this;
	}

	function store_1() {
		return _store;
	}

	function create_main_fragment$5(state, component) {
		var header, h1, text_1, text_3, div, ul, li, li_1, a_1, text_6, text_7, text_8, li_2, a_2, text_10, text_11, text_12, text_14, table, thead, text_30, tbody, await_block_1, await_block_type, await_token, promise, resolved;

		var button = new Button({
			root: component.root,
			data: {
				to: "/application/add",
				text: "Add Application",
				type: "add"
			}
		});

		function replace_await_block(token, type, value, state) {
			if (token !== await_token) return;

			var old_block = await_block_1;
			await_block_1 = (await_block_type = type)(state, resolved = value, component);

			if (old_block) {
				old_block.u();
				old_block.d();
				await_block_1.c();
				await_block_1.m(tbody, null);

				component.root.set({});
			}
		}

		function handle_promise(promise, state) {
			var token = await_token = {};

			if (isPromise(promise)) {
				promise.then(function (value) {
					var state = component.get();
					replace_await_block(token, create_then_block, value, state);
				}, function (error_1) {
					var state = component.get();
					replace_await_block(token, create_catch_block, error_1, state);
				});

				// if we previously had a then/catch block, destroy it
				if (await_block_type !== create_pending_block) {
					replace_await_block(token, create_pending_block, null, state);
					return true;
				}
			} else {
				resolved = promise;
				if (await_block_type !== create_then_block) {
					replace_await_block(token, create_then_block, resolved, state);
					return true;
				}
			}
		}

		handle_promise(promise = state.$applications, state);

		return {
			c: function create() {
				header = createElement("header");
				h1 = createElement("h1");
				h1.textContent = "Applications";
				text_1 = createText("\n    ");
				button._fragment.c();
				text_3 = createText("\n\n");
				div = createElement("div");
				ul = createElement("ul");
				li = createElement("li");
				li.innerHTML = "<a href=\"#applications-all\" title=\"All\">All</a>";
				li_1 = createElement("li");
				a_1 = createElement("a");
				text_6 = createText("Online(");
				text_7 = createText(state.$online);
				text_8 = createText(")");
				li_2 = createElement("li");
				a_2 = createElement("a");
				text_10 = createText("Offline(");
				text_11 = createText(state.$offline);
				text_12 = createText(")");
				text_14 = createText("\n\n    ");
				table = createElement("table");
				thead = createElement("thead");
				thead.innerHTML = "<tr><th></th>\n                <th></th>\n                <th>Status</th>\n                <th>Last 24 hours</th>\n                <th>Last Week</th>\n                <th>Downtime</th>\n                <th class=\"text-center\">Outages</th>\n                <th class=\"text-center\">Actions</th></tr>";
				text_30 = createText("\n        ");
				tbody = createElement("tbody");

				await_block_1.c();
				this.h();
			},

			h: function hydrate() {
				h1.className = "title";
				header.className = "row";
				li.className = "active";
				a_1.href = "#application-online";
				a_1.title = "Online(4)";
				a_2.href = "#application-offline";
				a_2.title = "Offline(1)";
				ul.className = "tab-menu";
				table.className = "table-rows-white";
				div.className = "layout-w";
			},

			m: function mount(target, anchor) {
				insertNode(header, target, anchor);
				appendNode(h1, header);
				appendNode(text_1, header);
				button._mount(header, null);
				insertNode(text_3, target, anchor);
				insertNode(div, target, anchor);
				appendNode(ul, div);
				appendNode(li, ul);
				appendNode(li_1, ul);
				appendNode(a_1, li_1);
				appendNode(text_6, a_1);
				appendNode(text_7, a_1);
				appendNode(text_8, a_1);
				appendNode(li_2, ul);
				appendNode(a_2, li_2);
				appendNode(text_10, a_2);
				appendNode(text_11, a_2);
				appendNode(text_12, a_2);
				appendNode(text_14, div);
				appendNode(table, div);
				appendNode(thead, table);
				appendNode(text_30, table);
				appendNode(tbody, table);

				await_block_1.m(tbody, null);
			},

			p: function update(changed, state) {
				if (changed.$online) {
					text_7.data = state.$online;
				}

				if (changed.$offline) {
					text_11.data = state.$offline;
				}

				if ('$applications' in changed && promise !== (promise = state.$applications) && handle_promise(promise, state)) {
					// nothing
				} else {
					await_block_1.p(changed, state, resolved);
				}
			},

			u: function unmount() {
				detachNode(header);
				detachNode(text_3);
				detachNode(div);

				await_block_1.u();
			},

			d: function destroy$$1() {
				button.destroy(false);

				await_token = null;
				await_block_1.d();
			}
		};
	}

	// (33:36)              <p>We are loading results...</p>             {{then response}}
	function create_pending_block(state, _, component) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.textContent = "We are loading results...";
			},

			m: function mount(target, anchor) {
				insertNode(p, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(p);
			},

			d: noop
		};
	}

	// (37:16) {{#each response as value}}
	function create_each_block(state, response, response_1, value, value_index, component) {

		var item = new ApplicationListItem({
			root: component.root,
			data: { item: value }
		});

		return {
			c: function create() {
				item._fragment.c();
			},

			m: function mount(target, anchor) {
				item._mount(target, anchor);
			},

			p: function update(changed, state, response, response_1, value, value_index) {
				var item_changes = {};
				if (changed.$applications) item_changes.item = value;
				item._set(item_changes);
			},

			u: function unmount() {
				item._unmount();
			},

			d: function destroy$$1() {
				item.destroy(false);
			}
		};
	}

	// (36:16) {{#if response}}
	function create_if_block(state, response, component) {
		var each_anchor;

		var response_1 = response;

		var each_blocks = [];

		for (var i = 0; i < response_1.length; i += 1) {
			each_blocks[i] = create_each_block(state, response, response_1, response_1[i], i, component);
		}

		return {
			c: function create() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_anchor = createComment();
			},

			m: function mount(target, anchor) {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insertNode(each_anchor, target, anchor);
			},

			p: function update(changed, state, response) {
				var response_1 = response;

				if (changed.$applications) {
					for (var i = 0; i < response_1.length; i += 1) {
						if (each_blocks[i]) {
							each_blocks[i].p(changed, state, response, response_1, response_1[i], i);
						} else {
							each_blocks[i] = create_each_block(state, response, response_1, response_1[i], i, component);
							each_blocks[i].c();
							each_blocks[i].m(each_anchor.parentNode, each_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = response_1.length;
				}
			},

			u: function unmount() {
				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}

				detachNode(each_anchor);
			},

			d: function destroy$$1() {
				destroyEach(each_blocks);
			}
		};
	}

	// (35:12) {{then response}}
	function create_then_block(state, response, component) {
		var if_block_anchor;

		var if_block = response && create_if_block(state, response, component);

		return {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = createComment();
			},

			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insertNode(if_block_anchor, target, anchor);
			},

			p: function update(changed, state, response) {
				if (response) {
					if (if_block) {
						if_block.p(changed, state, response);
					} else {
						if_block = create_if_block(state, response, component);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.u();
					if_block.d();
					if_block = null;
				}
			},

			u: function unmount() {
				if (if_block) if_block.u();
				detachNode(if_block_anchor);
			},

			d: function destroy$$1() {
				if (if_block) if_block.d();
			}
		};
	}

	// (41:12) {{catch error}}
	function create_catch_block(state, error, component) {
		var p;

		return {
			c: function create() {
				p = createElement("p");
				p.textContent = "Well that's odd... An error occurred during processing your request.";
			},

			m: function mount(target, anchor) {
				insertNode(p, target, anchor);
			},

			p: noop,

			u: function unmount() {
				detachNode(p);
			},

			d: noop
		};
	}

	function Home(options) {
		init(this, options);
		this.store = store_1();
		this._state = assign(this.store._init(["online", "offline", "applications"]), data$3(), options.data);
		this.store._add(this, ["online", "offline", "applications"]);

		this._handlers.destroy = [removeFromStore];

		var _oncreate = oncreate$1.bind(this);

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$5(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Home.prototype, methods$3, proto);

	/* modules/server/app/components/ProbeChart.html generated by Svelte v1.54.2 */
	function data$4() {
		return {
			probes: 0,
			mean: 0,
			min: 0,
			max: 0,
			errors: 0
		};
	}

	function oncreate$2() {
		var BAR_BG = '#8199ab';
		var HIGHLIGHT_BG = '#ff206a';

		var hour = ['hour', 47, 89, 47, 66, 47, 141, 66, 47, 122, 100, 141, 89, 173, 122, 100, 196, 66, 66, 47, 113, 66, 89, 66, 205, 100, 122, 66, 66, 47, 66, 100, 205, 66, 141, 89, 152, 47, 66, 152, 141, 47, 66, 89, 100, 205, 89, 47, 100, 66, 113, 66, 47, 100, 89, 113, 47, 66, 100, 47, 113, 100, 89, 47, 66, 47, 89, 66, 89, 100];
		return;
		var chart = bb.generate({
			data: {
				columns: [hour],
				type: 'bar',
				// set bars fill color
				colors: { data: BAR_BG },
				// set fill color for max values in chart
				onmax: function onmax(data) {
					data.forEach(function (v) {
						var max_el = d3.select("#js-chart-probe-latency .bb-shapes-" + v.id + " .bb-bar-" + v.index);
						max_el.style('fill', HIGHLIGHT_BG);
					});
				}
			},
			axis: {
				// hide axis
				x: {
					show: false
				},
				y: {
					show: false,
					// set y axis range
					min: 0,
					max: 165
					// padding: 0
				}
			},
			grid: {
				y: {
					show: true,
					lines: true
				},
				lines: { front: true }
			},
			legend: { show: false }, // hide legend
			bar: {
				width: { ratio: 0.35 }
			},
			bindto: '#js-chart-probe-latency'
		});

		window.chart = chart;
	}

	function create_main_fragment$6(state, component) {
		var link, text, article, div, p, text_1, text_2, div_1, text_3, div_2, ul, li, p_1, text_5, p_2, text_6, li_1, p_3, text_9, p_4, text_10, li_2, p_5, text_13, p_6, text_14, li_3, p_7, text_17, p_8, text_18, li_4, p_9, text_21, p_10, text_22, text_24, div_3;

		return {
			c: function create() {
				link = createElement("link");
				text = createText("\n\n");
				article = createElement("article");
				div = createElement("div");
				p = createElement("p");
				text_1 = createText(state.title);
				text_2 = createText("\n          ");
				div_1 = createElement("div");
				text_3 = createText("\n\n          ");
				div_2 = createElement("div");
				ul = createElement("ul");
				li = createElement("li");
				p_1 = createElement("p");
				p_1.textContent = "Probes";
				text_5 = createText("\n                ");
				p_2 = createElement("p");
				text_6 = createText(state.probes);
				li_1 = createElement("li");
				p_3 = createElement("p");
				p_3.textContent = "Mean";
				text_9 = createText("\n                ");
				p_4 = createElement("p");
				text_10 = createText(state.mean);
				li_2 = createElement("li");
				p_5 = createElement("p");
				p_5.textContent = "Min";
				text_13 = createText("\n                ");
				p_6 = createElement("p");
				text_14 = createText(state.min);
				li_3 = createElement("li");
				p_7 = createElement("p");
				p_7.textContent = "Max";
				text_17 = createText("\n                ");
				p_8 = createElement("p");
				text_18 = createText(state.max);
				li_4 = createElement("li");
				p_9 = createElement("p");
				p_9.textContent = "Errors";
				text_21 = createText("\n                ");
				p_10 = createElement("p");
				text_22 = createText(state.errors);
				text_24 = createText("\n\n            ");
				div_3 = createElement("div");
				div_3.innerHTML = "<div id=\"js-probe-latency-select\" class=\"dropdown-container\"><button class=\"btn btn-sm btn-primary btn-split dropdown-toggle btn-select\" role=\"button\"><span class=\"js-selection\">Hour</span>\n                  <span class=\"icon-arrow-down\"></span></button>\n                <menu class=\"dropdown-menu dm-aligned dm-primary\"><ul><li data-frequency=\"hour\" class=\"js-hidden\">Hour</li>\n                    <li data-frequency=\"day\">Day</li>\n                    <li data-frequency=\"week\">Week</li>\n                    <li data-frequency=\"month\">Month</li>\n                  </ul></menu></div>";
				this.h();
			},

			h: function hydrate() {
				link.rel = "stylesheet";
				link.href = "/css/billboard.min.css";
				p.className = "chart-bars-2__title";
				div_1.id = "js-chart-probe-latency";
				div_1.className = "chart-bars-2__chart";
				p_1.className = "chart-bars-2__details-title";
				p_2.className = "chart-bars-2__details-value";
				li.className = "chart-bars-2__detail";
				p_3.className = "chart-bars-2__details-title";
				p_4.className = "chart-bars-2__details-value";
				li_1.className = "chart-bars-2__detail";
				p_5.className = "chart-bars-2__details-title";
				p_6.className = "chart-bars-2__details-value";
				li_2.className = "chart-bars-2__detail";
				p_7.className = "chart-bars-2__details-title";
				p_8.className = "chart-bars-2__details-value";
				li_3.className = "chart-bars-2__detail";
				p_9.className = "chart-bars-2__details-title";
				p_10.className = "chart-bars-2__details-value";
				li_4.className = "chart-bars-2__detail";
				ul.className = "row";
				div_3.className = "chart-bars-2__select";
				div_2.className = "chart-bars-2__info row";
				div.className = "chart-bars-2";
				article.className = "panel-blue panel-3";
			},

			m: function mount(target, anchor) {
				appendNode(link, document.head);
				insertNode(text, target, anchor);
				insertNode(article, target, anchor);
				appendNode(div, article);
				appendNode(p, div);
				appendNode(text_1, p);
				appendNode(text_2, div);
				appendNode(div_1, div);
				appendNode(text_3, div);
				appendNode(div_2, div);
				appendNode(ul, div_2);
				appendNode(li, ul);
				appendNode(p_1, li);
				appendNode(text_5, li);
				appendNode(p_2, li);
				appendNode(text_6, p_2);
				appendNode(li_1, ul);
				appendNode(p_3, li_1);
				appendNode(text_9, li_1);
				appendNode(p_4, li_1);
				appendNode(text_10, p_4);
				appendNode(li_2, ul);
				appendNode(p_5, li_2);
				appendNode(text_13, li_2);
				appendNode(p_6, li_2);
				appendNode(text_14, p_6);
				appendNode(li_3, ul);
				appendNode(p_7, li_3);
				appendNode(text_17, li_3);
				appendNode(p_8, li_3);
				appendNode(text_18, p_8);
				appendNode(li_4, ul);
				appendNode(p_9, li_4);
				appendNode(text_21, li_4);
				appendNode(p_10, li_4);
				appendNode(text_22, p_10);
				appendNode(text_24, div_2);
				appendNode(div_3, div_2);
			},

			p: function update(changed, state) {
				if (changed.title) {
					text_1.data = state.title;
				}

				if (changed.probes) {
					text_6.data = state.probes;
				}

				if (changed.mean) {
					text_10.data = state.mean;
				}

				if (changed.min) {
					text_14.data = state.min;
				}

				if (changed.max) {
					text_18.data = state.max;
				}

				if (changed.errors) {
					text_22.data = state.errors;
				}
			},

			u: function unmount() {
				detachNode(link);
				detachNode(text);
				detachNode(article);
			},

			d: noop
		};
	}

	function ProbeChart(options) {
		init(this, options);
		this._state = assign(data$4(), options.data);

		var _oncreate = oncreate$2.bind(this);

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$6(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			callAll(this._oncreate);
		}
	}

	assign(ProbeChart.prototype, proto);

	/* modules/server/app/pages/ApplicationView.html generated by Svelte v1.54.2 */
	function data$5() {
		return {
			selected: 'info',
			app: {}
		};
	}

	function getStatus$1(online) {
		return online ? 'online' : 'offline';
	}

	function active(selected, val) {
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'visible';

		if (type === 'visible') {
			return selected === val ? 'visible' : 'hidden';
		}
		if (type === 'active') {
			return selected === val ? 'active' : 'inactive';
		}
	}

	var methods$4 = {
		select: function select(section) {
			this.set({ selected: section });
		}
	};

	function oncreate$3() {
		/**
   * TODO: We should do this in our navigation
   * step, so when it gets here is already 
   * loaded(?)
   */
		var appid = this.get('appid');
		bus.requestApplicationById(appid);

		window.page = this;
	}

	function store_1$1() {
		return _store;
	}

	function create_main_fragment$7(state, component) {
		var header,
		    div,
		    h1,
		    text_value = state.$application.identifier,
		    text,
		    text_1,
		    span,
		    div_data_status_value,
		    text_3,
		    text_5,
		    text_6,
		    div_1,
		    ul,
		    li,
		    li_class_value,
		    li_1,
		    li_1_class_value,
		    text_11,
		    section,
		    h2,
		    text_13,
		    div_2,
		    article,
		    table,
		    tbody,
		    tr,
		    td,
		    text_15,
		    td_1,
		    text_16_value = state.$application.appId,
		    text_16,
		    text_18,
		    tr_1,
		    td_2,
		    text_20,
		    td_3,
		    text_21_value = state.$application.hostname,
		    text_21,
		    text_23,
		    tr_2,
		    td_4,
		    text_25,
		    td_5,
		    text_26_value = state.$application.identifier,
		    text_26,
		    text_28,
		    tr_3,
		    td_6,
		    text_30,
		    td_7,
		    text_31_value = state.$application.environment,
		    text_31,
		    text_33,
		    tr_4,
		    td_8,
		    text_35,
		    td_9,
		    text_36_value = state.$application.createdAt,
		    text_36,
		    text_38,
		    tr_5,
		    td_10,
		    text_40,
		    td_11,
		    text_41_value = state.$application.updatedAt,
		    text_41,
		    text_45,
		    h3,
		    text_47,
		    hr,
		    text_48,
		    table_1,
		    text_75,
		    div_3,
		    section_class_value;

		var button = new Button({
			root: component.root,
			data: {
				to: "/application/" + state.appid + "/edit",
				text: "Edit Application",
				type: "edit"
			}
		});

		var chart = new ProbeChart({
			root: component.root,
			data: { title: "Probe Latency" }
		});

		function click_handler(event) {
			component.select('info');
		}

		function click_handler_1(event) {
			component.select('services');
		}

		return {
			c: function create() {
				header = createElement("header");
				div = createElement("div");
				h1 = createElement("h1");
				text = createText(text_value);
				text_1 = createText("\n        ");
				span = createElement("span");
				text_3 = createText("\n    ");
				button._fragment.c();
				text_5 = createText("\n\n\n");
				chart._fragment.c();
				text_6 = createText("\n\n");
				div_1 = createElement("div");
				ul = createElement("ul");
				li = createElement("li");
				li.innerHTML = "<a title=\"Info\">Info</a>";
				li_1 = createElement("li");
				li_1.innerHTML = "<a title=\"Services\">Services</a>";
				text_11 = createText("\n\n    ");
				section = createElement("section");
				h2 = createElement("h2");
				h2.textContent = "Information";
				text_13 = createText("\n        ");
				div_2 = createElement("div");
				article = createElement("article");
				table = createElement("table");
				tbody = createElement("tbody");
				tr = createElement("tr");
				td = createElement("td");
				td.textContent = "App ID:";
				text_15 = createText("\n                            ");
				td_1 = createElement("td");
				text_16 = createText(text_16_value);
				text_18 = createText("\n                        ");
				tr_1 = createElement("tr");
				td_2 = createElement("td");
				td_2.textContent = "Hostname:";
				text_20 = createText("\n                            ");
				td_3 = createElement("td");
				text_21 = createText(text_21_value);
				text_23 = createText("\n                        ");
				tr_2 = createElement("tr");
				td_4 = createElement("td");
				td_4.textContent = "Identifier:";
				text_25 = createText("\n                            ");
				td_5 = createElement("td");
				text_26 = createText(text_26_value);
				text_28 = createText("\n                        ");
				tr_3 = createElement("tr");
				td_6 = createElement("td");
				td_6.textContent = "Environment:";
				text_30 = createText("\n                            ");
				td_7 = createElement("td");
				text_31 = createText(text_31_value);
				text_33 = createText("\n                        ");
				tr_4 = createElement("tr");
				td_8 = createElement("td");
				td_8.textContent = "Created At:";
				text_35 = createText("\n                            ");
				td_9 = createElement("td");
				text_36 = createText(text_36_value);
				text_38 = createText("\n                        ");
				tr_5 = createElement("tr");
				td_10 = createElement("td");
				td_10.textContent = "Updated At:";
				text_40 = createText("\n                            ");
				td_11 = createElement("td");
				text_41 = createText(text_41_value);
				text_45 = createText("\n                ");
				h3 = createElement("h3");
				h3.textContent = "Metadata";
				text_47 = createText("\n                ");
				hr = createElement("hr");
				text_48 = createText("\n                ");
				table_1 = createElement("table");
				table_1.innerHTML = "<tbody><tr class=\"t-mixed-title\"><td>Health</td></tr>\n                        <tr class=\"t-mixed-details\"><td>URL:</td>\n                            <td>http://hotdesk.example.net/api/health</td></tr>\n                        <tr class=\"t-mixed-title\"><td>REPL</td></tr>\n                        <tr class=\"t-mixed-details\"><td>Port:</td>\n                            <td>4567</td></tr>\n                        <tr class=\"t-mixed-title\"><td>Server</td></tr>\n                        <tr class=\"t-mixed-details\"><td>Port:</td>\n                            <td>9876</td></tr></tbody>";
				text_75 = createText("\n\n            ");
				div_3 = createElement("div");
				div_3.innerHTML = "<article><h2>Last Week Outages</h2>\n                    <table class=\"table-rows\"><tbody><tr><td>ECONNREFUSED</td>\n                                <td>03:32</td>\n                                <td>Wed, 31 Jan 2018 02:24:23</td></tr>\n                            <tr><td>ECONNREFUSED</td>\n                                <td>07:02</td>\n                                <td>Mon, 12 Dec 2017 23:14:37</td></tr>\n                            <tr><td>ECONNREFUSED</td>\n                                <td>01:31</td>\n                                <td>Wed, 31 Jan 2018 13:48:42</td></tr></tbody></table></article>";
				this.h();
			},

			h: function hydrate() {
				h1.className = "title";
				span.className = "tag tag-status tag-small";
				div.className = "title";
				div.dataset.status = div_data_status_value = getStatus$1(state.$application.online);
				header.className = "row";
				li.className = li_class_value = active(state.selected, 'info', 'active');
				addListener(li, "click", click_handler);
				li_1.className = li_1_class_value = active(state.selected, 'services', 'active');
				addListener(li_1, "click", click_handler_1);
				ul.className = "tab-menu";
				table.className = "table-cols";
				table_1.className = "table-cols-mixed";
				article.className = "panel-white panel-1 col-left";
				div_3.className = "col col-right";
				div_2.className = "layout-2-cols";
				section.className = section_class_value = active(state.selected, 'info');
				div_1.className = "layout-w";
			},

			m: function mount(target, anchor) {
				insertNode(header, target, anchor);
				appendNode(div, header);
				appendNode(h1, div);
				appendNode(text, h1);
				appendNode(text_1, div);
				appendNode(span, div);
				appendNode(text_3, header);
				button._mount(header, null);
				insertNode(text_5, target, anchor);
				chart._mount(target, anchor);
				insertNode(text_6, target, anchor);
				insertNode(div_1, target, anchor);
				appendNode(ul, div_1);
				appendNode(li, ul);
				appendNode(li_1, ul);
				appendNode(text_11, div_1);
				appendNode(section, div_1);
				appendNode(h2, section);
				appendNode(text_13, section);
				appendNode(div_2, section);
				appendNode(article, div_2);
				appendNode(table, article);
				appendNode(tbody, table);
				appendNode(tr, tbody);
				appendNode(td, tr);
				appendNode(text_15, tr);
				appendNode(td_1, tr);
				appendNode(text_16, td_1);
				appendNode(text_18, tbody);
				appendNode(tr_1, tbody);
				appendNode(td_2, tr_1);
				appendNode(text_20, tr_1);
				appendNode(td_3, tr_1);
				appendNode(text_21, td_3);
				appendNode(text_23, tbody);
				appendNode(tr_2, tbody);
				appendNode(td_4, tr_2);
				appendNode(text_25, tr_2);
				appendNode(td_5, tr_2);
				appendNode(text_26, td_5);
				appendNode(text_28, tbody);
				appendNode(tr_3, tbody);
				appendNode(td_6, tr_3);
				appendNode(text_30, tr_3);
				appendNode(td_7, tr_3);
				appendNode(text_31, td_7);
				appendNode(text_33, tbody);
				appendNode(tr_4, tbody);
				appendNode(td_8, tr_4);
				appendNode(text_35, tr_4);
				appendNode(td_9, tr_4);
				appendNode(text_36, td_9);
				appendNode(text_38, tbody);
				appendNode(tr_5, tbody);
				appendNode(td_10, tr_5);
				appendNode(text_40, tr_5);
				appendNode(td_11, tr_5);
				appendNode(text_41, td_11);
				appendNode(text_45, article);
				appendNode(h3, article);
				appendNode(text_47, article);
				appendNode(hr, article);
				appendNode(text_48, article);
				appendNode(table_1, article);
				appendNode(text_75, div_2);
				appendNode(div_3, div_2);
			},

			p: function update(changed, state) {
				if (changed.$application && text_value !== (text_value = state.$application.identifier)) {
					text.data = text_value;
				}

				if (changed.$application && div_data_status_value !== (div_data_status_value = getStatus$1(state.$application.online))) {
					div.dataset.status = div_data_status_value;
				}

				var button_changes = {};
				if (changed.appid) button_changes.to = "/application/" + state.appid + "/edit";
				button._set(button_changes);

				if (changed.selected && li_class_value !== (li_class_value = active(state.selected, 'info', 'active'))) {
					li.className = li_class_value;
				}

				if (changed.selected && li_1_class_value !== (li_1_class_value = active(state.selected, 'services', 'active'))) {
					li_1.className = li_1_class_value;
				}

				if (changed.$application && text_16_value !== (text_16_value = state.$application.appId)) {
					text_16.data = text_16_value;
				}

				if (changed.$application && text_21_value !== (text_21_value = state.$application.hostname)) {
					text_21.data = text_21_value;
				}

				if (changed.$application && text_26_value !== (text_26_value = state.$application.identifier)) {
					text_26.data = text_26_value;
				}

				if (changed.$application && text_31_value !== (text_31_value = state.$application.environment)) {
					text_31.data = text_31_value;
				}

				if (changed.$application && text_36_value !== (text_36_value = state.$application.createdAt)) {
					text_36.data = text_36_value;
				}

				if (changed.$application && text_41_value !== (text_41_value = state.$application.updatedAt)) {
					text_41.data = text_41_value;
				}

				if (changed.selected && section_class_value !== (section_class_value = active(state.selected, 'info'))) {
					section.className = section_class_value;
				}
			},

			u: function unmount() {
				detachNode(header);
				detachNode(text_5);
				chart._unmount();
				detachNode(text_6);
				detachNode(div_1);
			},

			d: function destroy$$1() {
				button.destroy(false);
				chart.destroy(false);
				removeListener(li, "click", click_handler);
				removeListener(li_1, "click", click_handler_1);
			}
		};
	}

	function ApplicationView(options) {
		init(this, options);
		this.store = store_1$1();
		this._state = assign(this.store._init(["application"]), data$5(), options.data);
		this.store._add(this, ["application"]);

		this._handlers.destroy = [removeFromStore];

		var _oncreate = oncreate$3.bind(this);

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$7(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(ApplicationView.prototype, methods$4, proto);

	/* modules/server/app/pages/ApplicationAdd.html generated by Svelte v1.54.2 */
	function identity(item) {
		if (!item.appId && !item.hostname && !item.environment) return '';
		return item.appId + '.' + item.environment + '@' + item.hostname;
	}

	function data$6() {
		return {
			item: {
				appId: '',
				hostname: '',
				identifier: '',
				environment: ''
			}
		};
	}

	var methods$5 = {
		cancel: function cancel(event) {
			var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';

			if (event && event.preventDefault) {
				event.preventDefault();
			}

			if (path) {
				history.push(path);
			}
		},
		save: function save(event, item) {
			if (event && event.preventDefault) {
				event.preventDefault();
			}
			console.log('save', item);
		}
	};

	function oncreate$4() {
		var _this2 = this;

		this.observe('identity', function (value, old) {
			var item = _this2.get('item');
			item.identifier = value;
			_this2.set(item);
		});
	}

	function create_main_fragment$8(state, component) {
		var header,
		    text_3,
		    div_1,
		    ul,
		    text_6,
		    section,
		    form,
		    h2,
		    text_8,
		    article,
		    div_2,
		    label,
		    text_10,
		    input,
		    input_updating = false,
		    text_12,
		    div_3,
		    label_1,
		    text_14,
		    input_1,
		    input_1_updating = false,
		    text_16,
		    div_4,
		    label_2,
		    text_18,
		    input_2,
		    input_2_updating = false,
		    text_20,
		    div_5,
		    label_3,
		    text_22,
		    input_3,
		    input_3_updating = false,
		    text_25,
		    h2_1,
		    text_27,
		    article_1,
		    text_32,
		    div_7,
		    button,
		    text_34,
		    button_1;

		function input_input_handler() {
			var state = component.get();
			input_updating = true;
			state.item.appId = input.value;
			component.set({ item: state.item });
			input_updating = false;
		}

		function input_1_input_handler() {
			var state = component.get();
			input_1_updating = true;
			state.item.hostname = input_1.value;
			component.set({ item: state.item });
			input_1_updating = false;
		}

		function input_2_input_handler() {
			var state = component.get();
			input_2_updating = true;
			state.item.environment = input_2.value;
			component.set({ item: state.item });
			input_2_updating = false;
		}

		function input_3_input_handler() {
			var state = component.get();
			input_3_updating = true;
			state.item.identifier = input_3.value;
			component.set({ item: state.item });
			input_3_updating = false;
		}

		function click_handler(event) {
			component.cancel(event);
		}

		function click_handler_1(event) {
			var state = component.get();
			component.save(event, state.item);
		}

		return {
			c: function create() {
				header = createElement("header");
				header.innerHTML = "<div class=\"title\" data-status=\"online\"><h1 class=\"title\">Application: New</h1></div>";
				text_3 = createText("\n\n\n");
				div_1 = createElement("div");
				ul = createElement("ul");
				ul.innerHTML = "<li class=\"active\"><a href=\"#\" title=\"Info\">Information</a></li>\n    ";
				text_6 = createText("\n\n    ");
				section = createElement("section");
				form = createElement("form");
				h2 = createElement("h2");
				h2.textContent = "Information";
				text_8 = createText("\n            ");
				article = createElement("article");
				div_2 = createElement("div");
				label = createElement("label");
				label.textContent = "App ID";
				text_10 = createText("\n                    ");
				input = createElement("input");
				text_12 = createText("\n\n                ");
				div_3 = createElement("div");
				label_1 = createElement("label");
				label_1.textContent = "Hostname";
				text_14 = createText("\n                    ");
				input_1 = createElement("input");
				text_16 = createText("\n\n                ");
				div_4 = createElement("div");
				label_2 = createElement("label");
				label_2.textContent = "Environment";
				text_18 = createText("\n                    ");
				input_2 = createElement("input");
				text_20 = createText("\n\n                ");
				div_5 = createElement("div");
				label_3 = createElement("label");
				label_3.textContent = "Identifier";
				text_22 = createText("\n                    ");
				input_3 = createElement("input");
				text_25 = createText("\n\n            ");
				h2_1 = createElement("h2");
				h2_1.textContent = "Metadata";
				text_27 = createText("\n            ");
				article_1 = createElement("article");
				article_1.innerHTML = "<div class=\"form-group\"><label for=\"data\">Data</label>\n                    <textarea id=\"data\" value=\"Hotdesk\"></textarea></div>";
				text_32 = createText("\n\n            ");
				div_7 = createElement("div");
				button = createElement("button");
				button.textContent = "Cancel";
				text_34 = createText("\n                ");
				button_1 = createElement("button");
				button_1.textContent = "Save";
				this.h();
			},

			h: function hydrate() {
				header.className = "row";
				ul.className = "tab-menu";
				label.htmlFor = "app-id";
				addListener(input, "input", input_input_handler);
				input.type = "text";
				input.placeholder = "App ID";
				div_2.className = "form-group";
				label_1.htmlFor = "Hostname";
				addListener(input_1, "input", input_1_input_handler);
				input_1.type = "text";
				input_1.placeholder = "Hostname";
				div_3.className = "form-group";
				label_2.htmlFor = "environment";
				addListener(input_2, "input", input_2_input_handler);
				input_2.type = "text";
				input_2.placeholder = "Environment";
				div_4.className = "form-group";
				label_3.htmlFor = "identifier";
				addListener(input_3, "input", input_3_input_handler);
				input_3.value = state.identity;
				input_3.type = "text";
				input_3.placeholder = "Identifier";
				div_5.className = "form-group";
				article.className = "panel-white panel-1";
				article_1.className = "panel-white panel-1";
				button.className = "btn btn-secondary";
				setAttribute(button, "role", "button");
				addListener(button, "click", click_handler);
				button_1.className = "btn btn-primary";
				setAttribute(button_1, "role", "button");
				addListener(button_1, "click", click_handler_1);
				div_7.className = "row row-right";
				form.className = "form-rows";
				section.id = "info";
				div_1.className = "layout-w";
			},

			m: function mount(target, anchor) {
				insertNode(header, target, anchor);
				insertNode(text_3, target, anchor);
				insertNode(div_1, target, anchor);
				appendNode(ul, div_1);
				appendNode(text_6, div_1);
				appendNode(section, div_1);
				appendNode(form, section);
				appendNode(h2, form);
				appendNode(text_8, form);
				appendNode(article, form);
				appendNode(div_2, article);
				appendNode(label, div_2);
				appendNode(text_10, div_2);
				appendNode(input, div_2);

				input.value = state.item.appId;

				appendNode(text_12, article);
				appendNode(div_3, article);
				appendNode(label_1, div_3);
				appendNode(text_14, div_3);
				appendNode(input_1, div_3);

				input_1.value = state.item.hostname;

				appendNode(text_16, article);
				appendNode(div_4, article);
				appendNode(label_2, div_4);
				appendNode(text_18, div_4);
				appendNode(input_2, div_4);

				input_2.value = state.item.environment;

				appendNode(text_20, article);
				appendNode(div_5, article);
				appendNode(label_3, div_5);
				appendNode(text_22, div_5);
				appendNode(input_3, div_5);

				input_3.value = state.item.identifier;

				appendNode(text_25, form);
				appendNode(h2_1, form);
				appendNode(text_27, form);
				appendNode(article_1, form);
				appendNode(text_32, form);
				appendNode(div_7, form);
				appendNode(button, div_7);
				appendNode(text_34, div_7);
				appendNode(button_1, div_7);
			},

			p: function update(changed, state) {
				if (!input_updating) input.value = state.item.appId;
				if (!input_1_updating) input_1.value = state.item.hostname;
				if (!input_2_updating) input_2.value = state.item.environment;
				if (!input_3_updating) input_3.value = state.item.identifier;
				if (changed.identity) {
					input_3.value = state.identity;
				}
			},

			u: function unmount() {
				detachNode(header);
				detachNode(text_3);
				detachNode(div_1);
			},

			d: function destroy$$1() {
				removeListener(input, "input", input_input_handler);
				removeListener(input_1, "input", input_1_input_handler);
				removeListener(input_2, "input", input_2_input_handler);
				removeListener(input_3, "input", input_3_input_handler);
				removeListener(button, "click", click_handler);
				removeListener(button_1, "click", click_handler_1);
			}
		};
	}

	function ApplicationAdd(options) {
		init(this, options);
		this._state = assign(data$6(), options.data);
		this._recompute({ item: 1 }, this._state);

		var _oncreate = oncreate$4.bind(this);

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$8(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			callAll(this._oncreate);
		}
	}

	assign(ApplicationAdd.prototype, methods$5, proto);

	ApplicationAdd.prototype._recompute = function _recompute(changed, state) {
		if (changed.item) {
			if (differs(state.identity, state.identity = identity(state.item))) changed.identity = true;
		}
	};

	/* modules/server/app/pages/ApplicationEdit.html generated by Svelte v1.54.2 */
	function prevent(event) {
		if (event && event.preventDefault) {
			event.preventDefault();
		}
	}

	function data$7() {
		return {
			selected: 'info',
			app: {},
			service: {
				//application
				//endpoint
				//uuid
				errorAlterThreshold: 1,
				interval: 30000,
				latencyLimit: 5000,
				responseAlertThreshold: 1,
				timeoutAfter: 30000
			},
			attributes: []
		};
	}

	function formatDate() {
		var datetime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

		return datetime.replace('Z', '');
	}

	function getStatus$2(online) {
		return online ? 'online' : 'offline';
	}

	function active$1(selected, val) {
		var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'visible';

		if (type === 'visible') {
			return selected === val ? 'visible' : 'hidden';
		}
		if (type === 'active') {
			return selected === val ? 'active' : 'inactive';
		}
	}

	var methods$6 = {
		select: function select(section) {
			//this should update #
			this.set({ selected: section });
		},
		setAttributes: function setAttributes(data) {
			var attributes = this.get('attributes') || {};

			function parseKeys(obj) {
				var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

				Object.keys(obj).forEach(function (key) {
					path.push(key);
					var value = obj[key];
					if ((typeof value === 'undefined' ? 'undefined' : _typeof2(value)) === 'object') {
						return parseKeys(value, path);
					}
					attributes.push({
						key: key,
						value: value
					});
				});
			}
			parseKeys(data);

			this.set({ attributes: attributes });
		},
		submit: function submit(event) {
			prevent(event);
			console.log('submit!', this.get('app'));
		},
		cancel: function cancel(event) {
			var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';

			prevent(event);

			if (path) {
				bus.goto(path);
			}
		}
	};

	function oncreate$5() {
		var _this3 = this;

		var appid = this.get('appid');
		bus.requestApplicationById(appid);

		this.store.observe('application', function (app) {
			if (typeof app.then === 'function') {
				return;
			}

			_this3.setAttributes(app.data);
		});

		window.page = this;
	}

	function store_1$2() {
		return _store;
	}

	function encapsulateStyles(node) {
		setAttribute(node, "svelte-3348269699", "");
	}

	function add_css() {
		var style = createElement("style");
		style.id = 'svelte-3348269699-style';
		style.textContent = "[svelte-3348269699].visible,[svelte-3348269699] .visible{display:inherit}[svelte-3348269699].hidden,[svelte-3348269699] .hidden{display:none}";
		appendNode(style, document.head);
	}

	function create_main_fragment$9(state, component) {
		var header,
		    div,
		    h1,
		    text_value = state.$application.identifier,
		    text,
		    text_1,
		    span,
		    div_data_status_value,
		    text_4,
		    div_1,
		    ul,
		    li,
		    li_class_value,
		    li_1,
		    li_1_class_value,
		    text_9,
		    form,
		    section,
		    h2,
		    text_11,
		    article,
		    div_2,
		    label,
		    text_13,
		    input,
		    input_updating = false,
		    text_15,
		    div_3,
		    label_1,
		    text_17,
		    input_1,
		    input_1_updating = false,
		    text_19,
		    div_4,
		    label_2,
		    text_21,
		    input_2,
		    input_2_updating = false,
		    text_23,
		    div_5,
		    label_3,
		    text_25,
		    input_3,
		    input_3_updating = false,
		    text_27,
		    div_6,
		    label_4,
		    text_29,
		    input_4,
		    input_4_value_value,
		    text_31,
		    div_7,
		    label_5,
		    text_33,
		    input_5,
		    input_5_value_value,
		    text_36,
		    h2_1,
		    text_38,
		    article_1,
		    text_39,
		    div_8,
		    section_class_value,
		    text_45,
		    section_1,
		    h2_2,
		    text_47,
		    article_2,
		    div_9,
		    label_7,
		    text_49,
		    input_7,
		    input_7_updating = false,
		    text_51,
		    div_10,
		    label_8,
		    text_53,
		    input_8,
		    input_8_updating = false,
		    text_55,
		    div_11,
		    label_9,
		    text_57,
		    input_9,
		    input_9_updating = false,
		    text_59,
		    div_12,
		    label_10,
		    text_61,
		    input_10,
		    input_10_updating = false,
		    text_63,
		    div_13,
		    label_11,
		    text_65,
		    input_11,
		    input_11_updating = false,
		    section_1_class_value,
		    text_69,
		    div_14,
		    button,
		    text_71,
		    button_1;

		function click_handler(event) {
			component.select('info');
		}

		function click_handler_1(event) {
			component.select('services');
		}

		function input_input_handler() {
			var state = component.get();
			var $ = component.store.get();
			input_updating = true;
			state.$application.appId = input.value;
			component.store.set({ application: $.application });
			input_updating = false;
		}

		function input_1_input_handler() {
			var state = component.get();
			var $ = component.store.get();
			input_1_updating = true;
			state.$application.hostname = input_1.value;
			component.store.set({ application: $.application });
			input_1_updating = false;
		}

		function input_2_input_handler() {
			var state = component.get();
			var $ = component.store.get();
			input_2_updating = true;
			state.$application.identifier = input_2.value;
			component.store.set({ application: $.application });
			input_2_updating = false;
		}

		function input_3_input_handler() {
			var state = component.get();
			var $ = component.store.get();
			input_3_updating = true;
			state.$application.environment = input_3.value;
			component.store.set({ application: $.application });
			input_3_updating = false;
		}

		var attributes = state.attributes;

		var each_blocks = [];

		for (var i = 0; i < attributes.length; i += 1) {
			each_blocks[i] = create_each_block$1(state, attributes, attributes[i], i, component);
		}

		function input_7_input_handler() {
			var state = component.get();
			input_7_updating = true;
			state.service.interval = toNumber(input_7.value);
			component.set({ service: state.service });
			input_7_updating = false;
		}

		function input_8_input_handler() {
			var state = component.get();
			input_8_updating = true;
			state.service.latencyLimit = toNumber(input_8.value);
			component.set({ service: state.service });
			input_8_updating = false;
		}

		function input_9_input_handler() {
			var state = component.get();
			input_9_updating = true;
			state.service.responseAlertThreshold = toNumber(input_9.value);
			component.set({ service: state.service });
			input_9_updating = false;
		}

		function input_10_input_handler() {
			var state = component.get();
			input_10_updating = true;
			state.service.errorAlterThreshold = toNumber(input_10.value);
			component.set({ service: state.service });
			input_10_updating = false;
		}

		function input_11_input_handler() {
			var state = component.get();
			input_11_updating = true;
			state.service.timeoutAfter = toNumber(input_11.value);
			component.set({ service: state.service });
			input_11_updating = false;
		}

		function click_handler_2(event) {
			component.cancel(event);
		}

		function click_handler_3(event) {
			component.submit(event);
		}

		return {
			c: function create() {
				header = createElement("header");
				div = createElement("div");
				h1 = createElement("h1");
				text = createText(text_value);
				text_1 = createText("\n        ");
				span = createElement("span");
				text_4 = createText("\n\n\n");
				div_1 = createElement("div");
				ul = createElement("ul");
				li = createElement("li");
				li.innerHTML = "<a title=\"Info\">Info</a>";
				li_1 = createElement("li");
				li_1.innerHTML = "<a title=\"Services\">Services</a>";
				text_9 = createText("\n    ");
				form = createElement("form");
				section = createElement("section");
				h2 = createElement("h2");
				h2.textContent = "Information";
				text_11 = createText("\n            ");
				article = createElement("article");
				div_2 = createElement("div");
				label = createElement("label");
				label.textContent = "App ID";
				text_13 = createText("\n                    ");
				input = createElement("input");
				text_15 = createText("\n\n                ");
				div_3 = createElement("div");
				label_1 = createElement("label");
				label_1.textContent = "Hostname";
				text_17 = createText("\n                    ");
				input_1 = createElement("input");
				text_19 = createText("\n\n                ");
				div_4 = createElement("div");
				label_2 = createElement("label");
				label_2.textContent = "Identifier";
				text_21 = createText("\n                    ");
				input_2 = createElement("input");
				text_23 = createText("\n\n                ");
				div_5 = createElement("div");
				label_3 = createElement("label");
				label_3.textContent = "Environment";
				text_25 = createText("\n                    ");
				input_3 = createElement("input");
				text_27 = createText("\n\n                ");
				div_6 = createElement("div");
				label_4 = createElement("label");
				label_4.textContent = "Created At";
				text_29 = createText("\n                    ");
				input_4 = createElement("input");
				text_31 = createText("\n\n                ");
				div_7 = createElement("div");
				label_5 = createElement("label");
				label_5.textContent = "Updated At";
				text_33 = createText("\n                    ");
				input_5 = createElement("input");
				text_36 = createText("\n\n            ");
				h2_1 = createElement("h2");
				h2_1.textContent = "Metadata";
				text_38 = createText("\n            ");
				article_1 = createElement("article");

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				text_39 = createText("\n                ");
				div_8 = createElement("div");
				div_8.innerHTML = "<label for=\"upadted\">Attribute</label>\n                    <input value=\"\" type=\"text\">";
				text_45 = createText("\n    ");
				section_1 = createElement("section");
				h2_2 = createElement("h2");
				h2_2.textContent = "Services";
				text_47 = createText("\n            ");
				article_2 = createElement("article");
				div_9 = createElement("div");
				label_7 = createElement("label");
				label_7.textContent = "Interval";
				text_49 = createText("\n                    ");
				input_7 = createElement("input");
				text_51 = createText("\n\n                ");
				div_10 = createElement("div");
				label_8 = createElement("label");
				label_8.textContent = "Latency Limit";
				text_53 = createText("\n                    ");
				input_8 = createElement("input");
				text_55 = createText("\n\n                ");
				div_11 = createElement("div");
				label_9 = createElement("label");
				label_9.textContent = "Response Alert Threshold";
				text_57 = createText("\n                    ");
				input_9 = createElement("input");
				text_59 = createText("\n\n                ");
				div_12 = createElement("div");
				label_10 = createElement("label");
				label_10.textContent = "Error Alert Threshold";
				text_61 = createText("\n                    ");
				input_10 = createElement("input");
				text_63 = createText("\n\n                ");
				div_13 = createElement("div");
				label_11 = createElement("label");
				label_11.textContent = "Timeout After";
				text_65 = createText("\n                    ");
				input_11 = createElement("input");
				text_69 = createText("\n    ");
				div_14 = createElement("div");
				button = createElement("button");
				button.textContent = "Cancel";
				text_71 = createText("\n        ");
				button_1 = createElement("button");
				button_1.textContent = "Save";
				this.h();
			},

			h: function hydrate() {
				encapsulateStyles(header);
				h1.className = "title";
				span.className = "tag tag-status tag-small";
				div.className = "title";
				div.dataset.status = div_data_status_value = getStatus$2(state.$application.online);
				header.className = "row";
				encapsulateStyles(div_1);
				li.className = li_class_value = active$1(state.selected, 'info', 'active');
				addListener(li, "click", click_handler);
				li_1.className = li_1_class_value = active$1(state.selected, 'services', 'active');
				addListener(li_1, "click", click_handler_1);
				ul.className = "tab-menu";
				label.htmlFor = "app-id";
				addListener(input, "input", input_input_handler);
				input.id = "app-id";
				input.type = "text";
				div_2.className = "form-group";
				label_1.htmlFor = "hostname";
				addListener(input_1, "input", input_1_input_handler);
				input_1.id = "hostname";
				input_1.type = "text";
				div_3.className = "form-group";
				label_2.htmlFor = "identifier";
				addListener(input_2, "input", input_2_input_handler);
				input_2.id = "identifier";
				input_2.type = "text";
				div_4.className = "form-group";
				label_3.htmlFor = "environment";
				addListener(input_3, "input", input_3_input_handler);
				input_3.id = "environment";
				input_3.type = "text";
				div_5.className = "form-group";
				label_4.htmlFor = "created";
				input_4.id = "created";
				input_4.value = input_4_value_value = formatDate(state.$application.createdAt);
				input_4.type = "datetime-local";
				input_4.disabled = true;
				div_6.className = "form-group";
				label_5.htmlFor = "upadted";
				input_5.id = "updated";
				input_5.value = input_5_value_value = formatDate(state.$application.updatedAt);
				input_5.type = "datetime-local";
				input_5.disabled = true;
				div_7.className = "form-group";
				article.className = "panel-white panel-1";
				div_8.className = "form-group";
				article_1.className = "panel-white panel-1";
				section.id = "info";
				section.className = section_class_value = active$1(state.selected, 'info');
				label_7.htmlFor = "interval";
				addListener(input_7, "input", input_7_input_handler);
				input_7.name = "interval";
				input_7.type = "number";
				div_9.className = "form-group";
				label_8.htmlFor = "latency";
				addListener(input_8, "input", input_8_input_handler);
				input_8.name = "latency";
				input_8.type = "number";
				div_10.className = "form-group";
				label_9.htmlFor = "threshold";
				addListener(input_9, "input", input_9_input_handler);
				input_9.name = "threshold";
				input_9.type = "number";
				div_11.className = "form-group";
				label_10.htmlFor = "errorThreshold";
				addListener(input_10, "input", input_10_input_handler);
				input_10.name = "errorThreshold";
				input_10.type = "number";
				div_12.className = "form-group";
				label_11.htmlFor = "timeout";
				addListener(input_11, "input", input_11_input_handler);
				input_11.name = "timeout";
				input_11.type = "number";
				div_13.className = "form-group";
				article_2.className = "panel-white panel-1";
				section_1.id = "services";
				section_1.className = section_1_class_value = active$1(state.selected, 'services');
				button.className = "btn btn-secondary";
				setAttribute(button, "role", "button");
				addListener(button, "click", click_handler_2);
				button_1.className = "btn btn-primary";
				addListener(button_1, "click", click_handler_3);
				div_14.className = "row row-right";
				form.className = "form-rows";
				div_1.className = "layout-w";
			},

			m: function mount(target, anchor) {
				insertNode(header, target, anchor);
				appendNode(div, header);
				appendNode(h1, div);
				appendNode(text, h1);
				appendNode(text_1, div);
				appendNode(span, div);
				insertNode(text_4, target, anchor);
				insertNode(div_1, target, anchor);
				appendNode(ul, div_1);
				appendNode(li, ul);
				appendNode(li_1, ul);
				appendNode(text_9, div_1);
				appendNode(form, div_1);
				appendNode(section, form);
				appendNode(h2, section);
				appendNode(text_11, section);
				appendNode(article, section);
				appendNode(div_2, article);
				appendNode(label, div_2);
				appendNode(text_13, div_2);
				appendNode(input, div_2);

				input.value = state.$application.appId;

				appendNode(text_15, article);
				appendNode(div_3, article);
				appendNode(label_1, div_3);
				appendNode(text_17, div_3);
				appendNode(input_1, div_3);

				input_1.value = state.$application.hostname;

				appendNode(text_19, article);
				appendNode(div_4, article);
				appendNode(label_2, div_4);
				appendNode(text_21, div_4);
				appendNode(input_2, div_4);

				input_2.value = state.$application.identifier;

				appendNode(text_23, article);
				appendNode(div_5, article);
				appendNode(label_3, div_5);
				appendNode(text_25, div_5);
				appendNode(input_3, div_5);

				input_3.value = state.$application.environment;

				appendNode(text_27, article);
				appendNode(div_6, article);
				appendNode(label_4, div_6);
				appendNode(text_29, div_6);
				appendNode(input_4, div_6);
				appendNode(text_31, article);
				appendNode(div_7, article);
				appendNode(label_5, div_7);
				appendNode(text_33, div_7);
				appendNode(input_5, div_7);
				appendNode(text_36, section);
				appendNode(h2_1, section);
				appendNode(text_38, section);
				appendNode(article_1, section);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(article_1, null);
				}

				appendNode(text_39, article_1);
				appendNode(div_8, article_1);
				appendNode(text_45, form);
				appendNode(section_1, form);
				appendNode(h2_2, section_1);
				appendNode(text_47, section_1);
				appendNode(article_2, section_1);
				appendNode(div_9, article_2);
				appendNode(label_7, div_9);
				appendNode(text_49, div_9);
				appendNode(input_7, div_9);

				input_7.value = state.service.interval;

				appendNode(text_51, article_2);
				appendNode(div_10, article_2);
				appendNode(label_8, div_10);
				appendNode(text_53, div_10);
				appendNode(input_8, div_10);

				input_8.value = state.service.latencyLimit;

				appendNode(text_55, article_2);
				appendNode(div_11, article_2);
				appendNode(label_9, div_11);
				appendNode(text_57, div_11);
				appendNode(input_9, div_11);

				input_9.value = state.service.responseAlertThreshold;

				appendNode(text_59, article_2);
				appendNode(div_12, article_2);
				appendNode(label_10, div_12);
				appendNode(text_61, div_12);
				appendNode(input_10, div_12);

				input_10.value = state.service.errorAlterThreshold;

				appendNode(text_63, article_2);
				appendNode(div_13, article_2);
				appendNode(label_11, div_13);
				appendNode(text_65, div_13);
				appendNode(input_11, div_13);

				input_11.value = state.service.timeoutAfter;

				appendNode(text_69, form);
				appendNode(div_14, form);
				appendNode(button, div_14);
				appendNode(text_71, div_14);
				appendNode(button_1, div_14);
			},

			p: function update(changed, state) {
				if (changed.$application && text_value !== (text_value = state.$application.identifier)) {
					text.data = text_value;
				}

				if (changed.$application && div_data_status_value !== (div_data_status_value = getStatus$2(state.$application.online))) {
					div.dataset.status = div_data_status_value;
				}

				if (changed.selected && li_class_value !== (li_class_value = active$1(state.selected, 'info', 'active'))) {
					li.className = li_class_value;
				}

				if (changed.selected && li_1_class_value !== (li_1_class_value = active$1(state.selected, 'services', 'active'))) {
					li_1.className = li_1_class_value;
				}

				if (!input_updating) input.value = state.$application.appId;
				if (!input_1_updating) input_1.value = state.$application.hostname;
				if (!input_2_updating) input_2.value = state.$application.identifier;
				if (!input_3_updating) input_3.value = state.$application.environment;
				if (changed.$application && input_4_value_value !== (input_4_value_value = formatDate(state.$application.createdAt))) {
					input_4.value = input_4_value_value;
				}

				if (changed.$application && input_5_value_value !== (input_5_value_value = formatDate(state.$application.updatedAt))) {
					input_5.value = input_5_value_value;
				}

				var attributes = state.attributes;

				if (changed.attributes) {
					for (var i = 0; i < attributes.length; i += 1) {
						if (each_blocks[i]) {
							each_blocks[i].p(changed, state, attributes, attributes[i], i);
						} else {
							each_blocks[i] = create_each_block$1(state, attributes, attributes[i], i, component);
							each_blocks[i].c();
							each_blocks[i].m(article_1, text_39);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].u();
						each_blocks[i].d();
					}
					each_blocks.length = attributes.length;
				}

				if (changed.selected && section_class_value !== (section_class_value = active$1(state.selected, 'info'))) {
					section.className = section_class_value;
				}

				if (!input_7_updating) input_7.value = state.service.interval;
				if (!input_8_updating) input_8.value = state.service.latencyLimit;
				if (!input_9_updating) input_9.value = state.service.responseAlertThreshold;
				if (!input_10_updating) input_10.value = state.service.errorAlterThreshold;
				if (!input_11_updating) input_11.value = state.service.timeoutAfter;
				if (changed.selected && section_1_class_value !== (section_1_class_value = active$1(state.selected, 'services'))) {
					section_1.className = section_1_class_value;
				}
			},

			u: function unmount() {
				detachNode(header);
				detachNode(text_4);
				detachNode(div_1);

				for (var i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].u();
				}
			},

			d: function destroy$$1() {
				removeListener(li, "click", click_handler);
				removeListener(li_1, "click", click_handler_1);
				removeListener(input, "input", input_input_handler);
				removeListener(input_1, "input", input_1_input_handler);
				removeListener(input_2, "input", input_2_input_handler);
				removeListener(input_3, "input", input_3_input_handler);

				destroyEach(each_blocks);

				removeListener(input_7, "input", input_7_input_handler);
				removeListener(input_8, "input", input_8_input_handler);
				removeListener(input_9, "input", input_9_input_handler);
				removeListener(input_10, "input", input_10_input_handler);
				removeListener(input_11, "input", input_11_input_handler);
				removeListener(button, "click", click_handler_2);
				removeListener(button_1, "click", click_handler_3);
			}
		};
	}

	// (56:16) {{#each attributes as attr}}
	function create_each_block$1(state, attributes, attr, attr_index, component) {
		var div,
		    label,
		    text_value = attr.key,
		    text,
		    text_1,
		    input,
		    input_value_value;

		return {
			c: function create() {
				div = createElement("div");
				label = createElement("label");
				text = createText(text_value);
				text_1 = createText("\n                    ");
				input = createElement("input");
				this.h();
			},

			h: function hydrate() {
				label.htmlFor = "upadted";
				input.value = input_value_value = attr.value;
				input.type = "text";
				div.className = "form-group";
			},

			m: function mount(target, anchor) {
				insertNode(div, target, anchor);
				appendNode(label, div);
				appendNode(text, label);
				appendNode(text_1, div);
				appendNode(input, div);
			},

			p: function update(changed, state, attributes, attr, attr_index) {
				if (changed.attributes && text_value !== (text_value = attr.key)) {
					text.data = text_value;
				}

				if (changed.attributes && input_value_value !== (input_value_value = attr.value)) {
					input.value = input_value_value;
				}
			},

			u: function unmount() {
				detachNode(div);
			},

			d: noop
		};
	}

	function ApplicationEdit(options) {
		init(this, options);
		this.store = store_1$2();
		this._state = assign(this.store._init(["application"]), data$7(), options.data);
		this.store._add(this, ["application"]);

		this._handlers.destroy = [removeFromStore];

		if (!document.getElementById("svelte-3348269699-style")) add_css();

		var _oncreate = oncreate$5.bind(this);

		if (!options.root) {
			this._oncreate = [];
		}

		this._fragment = create_main_fragment$9(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			callAll(this._oncreate);
		}
	}

	assign(ApplicationEdit.prototype, methods$6, proto);

	/* modules/server/app/Application.html generated by Svelte v1.54.2 */
	var router = createRouter({
		'/': Home,
		'/application/add': ApplicationAdd,
		'/application/:appid/edit': ApplicationEdit,
		'/application/:appid': ApplicationView
	});

	window.api = api;
	window.router = router;

	window.go = function (url) {
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		history.push(url);
	};

	var methods$7 = {
		go: function go(url) {
			var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			history.push(url);
		}
	};

	function oncreate$6() {
		router.start(location, document.querySelector('#content'));
	}

	function ondestroy() {
		router.teardown();
	}

	function create_main_fragment$10(state, component) {
		var text, main, text_1;

		var header = new Header({
			root: component.root
		});

		var footer = new Footer({
			root: component.root
		});

		return {
			c: function create() {
				header._fragment.c();
				text = createText("\n\n");
				main = createElement("main");
				text_1 = createText("\n\n");
				footer._fragment.c();
				this.h();
			},

			h: function hydrate() {
				main.id = "content";
			},

			m: function mount(target, anchor) {
				header._mount(target, anchor);
				insertNode(text, target, anchor);
				insertNode(main, target, anchor);
				insertNode(text_1, target, anchor);
				footer._mount(target, anchor);
			},

			p: noop,

			u: function unmount() {
				header._unmount();
				detachNode(text);
				detachNode(main);
				detachNode(text_1);
				footer._unmount();
			},

			d: function destroy$$1() {
				header.destroy(false);
				footer.destroy(false);
			}
		};
	}

	function Application(options) {
		init(this, options);
		this._state = assign({}, options.data);

		this._handlers.destroy = [ondestroy];

		var _oncreate = oncreate$6.bind(this);

		if (!options.root) {
			this._oncreate = [];
			this._beforecreate = [];
			this._aftercreate = [];
		}

		this._fragment = create_main_fragment$10(this._state, this);

		this.root._oncreate.push(_oncreate);

		if (options.target) {
			this._fragment.c();
			this._fragment.m(options.target, options.anchor || null);

			this._lock = true;
			callAll(this._beforecreate);
			callAll(this._oncreate);
			callAll(this._aftercreate);
			this._lock = false;
		}
	}

	assign(Application.prototype, methods$7, proto);

	var states = bus.EVENT_TYPES;

	bus.requestCompiledData = function () {
		bus.dispatch(bus.EVENT_TYPES.REQUEST_COMPILE_DATA);
	};

	bus.requestApplicationById = function (id) {
		bus.dispatch(bus.EVENT_TYPES.REQUEST_APPLICATION_ID, { id: id });
	};

	bus.goto = function (uri) {
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		bus.dispatch(bus.EVENT_TYPES.NAVIGATION_GOTO, { uri: uri, data: data });
	};

	bus.handle(states.REQUEST_APPLICATION_ID, function (data) {
		var promise = api.getApplication(data.id);
		promise.then(function (application) {
			_store.set({ application: application });
		});
		_store.set({ application: promise });
	});

	bus.handle(states.NAVIGATION_GOTO, function (data) {
		console.log('NAVIGATION_GOTO', data);
		history.push(data.uri);
	});

	bus.handle(states.REQUEST_COMPILE_DATA, function (_) {

		var promise = api.buildApplicationInsights();

		/*
   * Here we should parse and create our
   * data set. 
   */
		promise.then(function (applications) {
			_store.set({
				online: 2,
				offline: 0,
				applications: applications
			});
		});

		_store.set({ applications: promise });
	});

	var app = new Application({
		//this breaks the layout, it does not support being wrapped by div
		// target: document.querySelector('#wrapper')
		target: document.getElementsByTagName('body')[0],
		store: function store() {
			return _store;
		}
	});

	window.app = app;
	window.bus = bus;
	window.rootStore = _store;
})();
