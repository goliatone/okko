var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

  function createElement(name) {
    return document.createElement(name);
  }

  function createText(data) {
    return document.createTextNode(data);
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
      fns.pop()();
    }
  }

  function _mount(target, anchor) {
    this._fragment.m(target, anchor);
  }

  function _unmount() {
    if (this._fragment) this._fragment.u();
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

  /** @module route/nodes */

  /**
   * Create a node for use with the parser, giving it a constructor that takes
   * props, children, and returns an object with props, children, and a
   * displayName.
   * @param  {String} displayName The display name for the node
   * @return {{displayName: string, props: Object, children: Array}}
   */
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

  /** Wrap the compiled parser with the context to create node objects */
  var parser = compiledGrammar.parser;
  parser.yy = nodes;
  var parser_1 = parser;

  /**
   * @module route/visitors/create_visitor
   */

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

  /**
   * Visitor for the AST to construct a path with filled in parameters
   * @class ReverseVisitor
   * @borrows Visitor-visit
   */
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

  /**
   * Copyright 2014-2015, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   */

  /**
   * Similar to invariant but only logs a warning if the condition is not met.
   * This can be used to log issues in development environments in critical
   * paths. Removing the logging code for production environments will keep the
   * same logic and follow the same code paths.
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

  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
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

  var uppercase = function uppercase(string) {
    return string.toUpperCase();
  };

  /* modules/server/app/components/pages/counter.html generated by Svelte v1.51.1 */
  function data() {
    return {
      count: 0
    };
  }

  var methods = {
    updateCount: function updateCount(val) {
      this.set({ count: this.get('count') + val });
      this.fire('counterChanged');
    }
  };

  function oncreate() {
    this.observeCount = this.observe('count', function (newCount, oldCount) {
      console.log('Count changed from ' + oldCount + ' to ' + newCount);
    }, { init: false });
  }

  function encapsulateStyles(node) {
    setAttribute(node, "svelte-478020602", "");
  }

  function add_css() {
    var style = createElement("style");
    style.id = 'svelte-478020602-style';
    style.textContent = "[svelte-478020602].counter,[svelte-478020602] .counter{padding:0.8rem}[svelte-478020602].button,[svelte-478020602] .button{padding:0.8rem;background:#121212;color:#fff;font-size:1.2rem;border:0;outline:0;font-family:helvetica, sans-serif}";
    appendNode(style, document.head);
  }

  function create_main_fragment(state, component) {
    var section,
        p,
        text,
        text_1,
        text_2,
        button,
        text_3_value = uppercase('Increment'),
        text_3,
        text_4,
        button_1;

    function click_handler(event) {
      component.updateCount(1);
    }

    function click_handler_1(event) {
      component.updateCount(-1);
    }

    return {
      c: function create() {
        section = createElement("section");
        p = createElement("p");
        text = createText("Count: ");
        text_1 = createText(state.count);
        text_2 = createText("\n        ");
        button = createElement("button");
        text_3 = createText(text_3_value);
        text_4 = createText("\n        ");
        button_1 = createElement("button");
        button_1.textContent = "Decrement";
        this.h();
      },

      h: function hydrate() {
        encapsulateStyles(section);
        button.className = "button";
        addListener(button, "click", click_handler);
        button_1.className = "button";
        addListener(button_1, "click", click_handler_1);
        section.className = "counter";
      },

      m: function mount(target, anchor) {
        insertNode(section, target, anchor);
        appendNode(p, section);
        appendNode(text, p);
        appendNode(text_1, p);
        appendNode(text_2, section);
        appendNode(button, section);
        appendNode(text_3, button);
        appendNode(text_4, section);
        appendNode(button_1, section);
      },

      p: function update(changed, state) {
        if (changed.count) {
          text_1.data = state.count;
        }
      },

      u: function unmount() {
        detachNode(section);
      },

      d: function destroy$$1() {
        removeListener(button, "click", click_handler);
        removeListener(button_1, "click", click_handler_1);
      }
    };
  }

  function Counter(options) {
    init(this, options);
    this._state = assign(data(), options.data);

    if (!document.getElementById("svelte-478020602-style")) add_css();

    var _oncreate = oncreate.bind(this);

    if (!options.root) {
      this._oncreate = [_oncreate];
    } else {
      this.root._oncreate.push(_oncreate);
    }

    this._fragment = create_main_fragment(this._state, this);

    if (options.target) {
      this._fragment.c();
      this._fragment.m(options.target, options.anchor || null);

      callAll(this._oncreate);
    }
  }

  assign(Counter.prototype, methods, proto);

  /* modules/server/app/components/pages/about.html generated by Svelte v1.51.1 */
  function create_main_fragment$1(state, component) {
    var h2, text_1;

    var counter = new Counter({
      root: component.root,
      data: { count: 7 }
    });

    return {
      c: function create() {
        h2 = createElement("h2");
        h2.textContent = "Page: About";
        text_1 = createText("\n");
        counter._fragment.c();
      },

      m: function mount(target, anchor) {
        insertNode(h2, target, anchor);
        insertNode(text_1, target, anchor);
        counter._mount(target, anchor);
      },

      p: noop,

      u: function unmount() {
        detachNode(h2);
        detachNode(text_1);
        counter._unmount();
      },

      d: function destroy$$1() {
        counter.destroy(false);
      }
    };
  }

  function About(options) {
    init(this, options);
    this._state = assign({}, options.data);

    if (!options.root) {
      this._oncreate = [];
      this._beforecreate = [];
      this._aftercreate = [];
    }

    this._fragment = create_main_fragment$1(this._state, this);

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

  assign(About.prototype, proto);

  /* modules/server/app/components/pages/footer.html generated by Svelte v1.51.1 */
  function create_main_fragment$2(state, component) {
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

    this._fragment = create_main_fragment$2(this._state, this);

    if (options.target) {
      this._fragment.c();
      this._fragment.m(options.target, options.anchor || null);
    }
  }

  assign(Footer.prototype, proto);

  /* modules/server/app/components/pages/time.html generated by Svelte v1.51.1 */
  function hours(time) {
    return time.getHours();
  }

  function mins(time) {
    return time.getMinutes();
  }

  function sec(time) {
    return time.getSeconds();
  }

  function data$1() {
    return {
      time: new Date()
    };
  }

  function oncreate$1() {
    var _this = this;

    this.interval = setInterval(function () {
      _this.set({ time: new Date() });
    }, 100);
  }

  function ondestroy() {
    clearInterval(this.interval);
  }

  function encapsulateStyles$1(node) {
    setAttribute(node, "svelte-2333974502", "");
  }

  function add_css$1() {
    var style = createElement("style");
    style.id = 'svelte-2333974502-style';
    style.textContent = "[svelte-2333974502].time,[svelte-2333974502] .time{padding:0.8rem}";
    appendNode(style, document.head);
  }

  function create_main_fragment$3(state, component) {
    var section, p, text, text_1, text_2, text_3, text_4, text_5;

    return {
      c: function create() {
        section = createElement("section");
        p = createElement("p");
        text = createText("Time: ");
        text_1 = createText(state.hours);
        text_2 = createText(":");
        text_3 = createText(state.mins);
        text_4 = createText(":");
        text_5 = createText(state.sec);
        this.h();
      },

      h: function hydrate() {
        encapsulateStyles$1(section);
        section.className = "time";
      },

      m: function mount(target, anchor) {
        insertNode(section, target, anchor);
        appendNode(p, section);
        appendNode(text, p);
        appendNode(text_1, p);
        appendNode(text_2, p);
        appendNode(text_3, p);
        appendNode(text_4, p);
        appendNode(text_5, p);
      },

      p: function update(changed, state) {
        if (changed.hours) {
          text_1.data = state.hours;
        }

        if (changed.mins) {
          text_3.data = state.mins;
        }

        if (changed.sec) {
          text_5.data = state.sec;
        }
      },

      u: function unmount() {
        detachNode(section);
      },

      d: noop
    };
  }

  function Time(options) {
    init(this, options);
    this._state = assign(data$1(), options.data);
    this._recompute({ time: 1 }, this._state);

    this._handlers.destroy = [ondestroy];

    if (!document.getElementById("svelte-2333974502-style")) add_css$1();

    var _oncreate = oncreate$1.bind(this);

    if (!options.root) {
      this._oncreate = [_oncreate];
    } else {
      this.root._oncreate.push(_oncreate);
    }

    this._fragment = create_main_fragment$3(this._state, this);

    if (options.target) {
      this._fragment.c();
      this._fragment.m(options.target, options.anchor || null);

      callAll(this._oncreate);
    }
  }

  assign(Time.prototype, proto);

  Time.prototype._recompute = function _recompute(changed, state) {
    if (changed.time) {
      if (differs(state.hours, state.hours = hours(state.time))) changed.hours = true;
      if (differs(state.mins, state.mins = mins(state.time))) changed.mins = true;
      if (differs(state.sec, state.sec = sec(state.time))) changed.sec = true;
    }
  };

  /* modules/server/app/components/pages/home.html generated by Svelte v1.51.1 */
  function create_main_fragment$4(state, component) {
    var h2, text_1;

    var time = new Time({
      root: component.root
    });

    return {
      c: function create() {
        h2 = createElement("h2");
        h2.textContent = "Page: Home";
        text_1 = createText("\n");
        time._fragment.c();
      },

      m: function mount(target, anchor) {
        insertNode(h2, target, anchor);
        insertNode(text_1, target, anchor);
        time._mount(target, anchor);
      },

      p: noop,

      u: function unmount() {
        detachNode(h2);
        detachNode(text_1);
        time._unmount();
      },

      d: function destroy$$1() {
        time.destroy(false);
      }
    };
  }

  function Home(options) {
    init(this, options);
    this._state = assign({}, options.data);

    if (!options.root) {
      this._oncreate = [];
      this._beforecreate = [];
      this._aftercreate = [];
    }

    this._fragment = create_main_fragment$4(this._state, this);

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

  assign(Home.prototype, proto);

  /* modules/server/app/components/pages/header.html generated by Svelte v1.51.1 */
  function encapsulateStyles$2(node) {
    setAttribute(node, "svelte-4281780511", "");
  }

  function add_css$2() {
    var style = createElement("style");
    style.id = 'svelte-4281780511-style';
    style.textContent = "[svelte-4281780511].header,[svelte-4281780511] .header{padding:0.8rem;background:#000}[svelte-4281780511].header__text,[svelte-4281780511] .header__text{color:#fff}";
    appendNode(style, document.head);
  }

  function create_main_fragment$5(state, component) {
    var header, h1, text, text_1;

    return {
      c: function create() {
        header = createElement("header");
        h1 = createElement("h1");
        text = createText("Welcome to ");
        text_1 = createText(state.name);
        this.h();
      },

      h: function hydrate() {
        encapsulateStyles$2(header);
        h1.className = "header__text";
        header.className = "header";
      },

      m: function mount(target, anchor) {
        insertNode(header, target, anchor);
        appendNode(h1, header);
        appendNode(text, h1);
        appendNode(text_1, h1);
      },

      p: function update(changed, state) {
        if (changed.name) {
          text_1.data = state.name;
        }
      },

      u: function unmount() {
        detachNode(header);
      },

      d: noop
    };
  }

  function Header(options) {
    init(this, options);
    this._state = assign({}, options.data);

    if (!document.getElementById("svelte-4281780511-style")) add_css$2();

    this._fragment = create_main_fragment$5(this._state, this);

    if (options.target) {
      this._fragment.c();
      this._fragment.m(options.target, options.anchor || null);
    }
  }

  assign(Header.prototype, proto);

  /* modules/server/app/components/Link.html generated by Svelte v1.51.1 */
  function data$2() {
    return {
      text: '',
      to: '/'
    };
  }

  var methods$1 = {
    navigate: function navigate(evt, path) {
      if (evt && evt.preventDefault) {
        evt.preventDefault();
      }
      if (path) {
        history.push(path);
      }
    }
  };

  function create_main_fragment$6(state, component) {
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
    this._state = assign(data$2(), options.data);

    this._fragment = create_main_fragment$6(this._state, this);

    if (options.target) {
      this._fragment.c();
      this._fragment.m(options.target, options.anchor || null);
    }
  }

  assign(Link.prototype, methods$1, proto);

  /* modules/server/app/components/Application.html generated by Svelte v1.51.1 */
  var router = createRouter({
    "/": Home,
    "/about": About
  });
  function oncreate$2() {
    router.start(window.location, window.document.querySelector("#content"));
  }

  function ondestroy$1() {
    router.teardown();
  }

  function create_main_fragment$7(state, component) {
    var text, nav, text_1, text_3, section, text_4;

    var header = new Header({
      root: component.root,
      data: { name: "DAZN" }
    });

    var link = new Link({
      root: component.root,
      data: { to: "/", text: "Home" }
    });

    var link_1 = new Link({
      root: component.root,
      data: { to: "/about", text: "About" }
    });

    var footer = new Footer({
      root: component.root
    });

    return {
      c: function create() {
        header._fragment.c();
        text = createText("\n");
        nav = createElement("nav");
        link._fragment.c();
        text_1 = createText("\n    ");
        link_1._fragment.c();
        text_3 = createText("\n");
        section = createElement("section");
        text_4 = createText("\n");
        footer._fragment.c();
        this.h();
      },

      h: function hydrate() {
        section.id = "content";
      },

      m: function mount(target, anchor) {
        header._mount(target, anchor);
        insertNode(text, target, anchor);
        insertNode(nav, target, anchor);
        link._mount(nav, null);
        appendNode(text_1, nav);
        link_1._mount(nav, null);
        insertNode(text_3, target, anchor);
        insertNode(section, target, anchor);
        insertNode(text_4, target, anchor);
        footer._mount(target, anchor);
      },

      p: noop,

      u: function unmount() {
        header._unmount();
        detachNode(text);
        detachNode(nav);
        detachNode(text_3);
        detachNode(section);
        detachNode(text_4);
        footer._unmount();
      },

      d: function destroy$$1() {
        header.destroy(false);
        link.destroy(false);
        link_1.destroy(false);
        footer.destroy(false);
      }
    };
  }

  function Application(options) {
    init(this, options);
    this._state = assign({}, options.data);

    this._handlers.destroy = [ondestroy$1];

    var _oncreate = oncreate$2.bind(this);

    if (!options.root) {
      this._oncreate = [_oncreate];
      this._beforecreate = [];
      this._aftercreate = [];
    } else {
      this.root._oncreate.push(_oncreate);
    }

    this._fragment = create_main_fragment$7(this._state, this);

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

  assign(Application.prototype, proto);

  var app = new Application({
    target: document.querySelector('app')
  });
})();
