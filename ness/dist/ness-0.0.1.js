var ness;
(function (modules) {
    var cache = {}, require = function (id) {
            var module = cache[id];
            if (!module) {
                module = cache[id] = {};
                var exports = module.exports = {};
                modules[id].call(exports, require, module, exports, window);
            }
            return module.exports;
        };
    ness = require('0');
}({
    '0': function (require, module, exports, global) {
        var tokenizer = require('1');
        exports.tokenizer = tokenizer;
    },
    '1': function (require, module, exports, global) {
        var _uid = 1;
        function uid() {
            return _uid++;
        }
        function getLineInfo(input, offset) {
            for (var line = 1, cur = 0;;) {
                rLineBreak.lastIndex = cur;
                var match = rLineBreak.exec(input);
                if (match && match.index < offset) {
                    ++line;
                    cur = match.index + match[0].length;
                } else
                    break;
            }
            return {
                line: line,
                column: offset - cur
            };
        }
        function toAssert(str) {
            var arr = typeof str == 'string' ? str.split(/\s+/) : str, regexp = new RegExp('^(?:' + arr.join('|') + ')$');
            return function (word) {
                return regexp.test(word);
            };
        }
        function createToken(type, val) {
            return {
                type: type,
                val: val
            };
        }
        var EOF = exports.EOF = uid();
        var WS = exports.WS = uid();
        var NEWLINE = exports.NEWLINE = uid();
        var COMMENT = exports.COMMENT = uid();
        var FLAG = exports.FLAG = uid();
        var PARENL = exports.PARENL = uid();
        var PARENR = exports.PARENR = uid();
        var COMMA = exports.COMMA = uid();
        var COLON = exports.COLON = uid();
        var BRACEL = exports.BRACEL = uid();
        var BRACER = exports.BRACER = uid();
        var SEMICOLON = exports.SEMICOLON = uid();
        var PUNCTUATORS = {
                '{': { type: PARENL },
                '}': { type: PARENR },
                ',': { type: COMMA },
                ':': { type: COLON },
                '(': { type: BRACEL },
                ')': { type: BRACER },
                ';': { type: SEMICOLON }
            };
        var nessKeyword = 'mixin extend';
        var cssKeyWord = 'keyframe media page import';
        var rNewLine = /[\n\r\f]/;
        var rLineBreak = /\r\n|[\n\r\f]/g;
        var rIdentStart = /^[-a-zA-Z_]/;
        var rIdentVal = /^[-\w]/;
        var isWhiteSpace = function (char) {
            return char === '\t' || char === ' ';
        };
        var isAtKeyWord = toAssert(nessKeyword + ' ' + cssKeyWord);
        exports.tokenize = function (input, options) {
            return new Tokenizer(input, options);
        };
        function Tokenizer(input, options) {
            this.options = options || {};
            this.input = input.replace('\r\n', '\n');
            this.length = this.input.length;
            this.pos = 0;
            this.char = this.input[0];
        }
        Tokenizer.prototype = {
            constructor: Tokenizer,
            eat: function (num) {
                if (typeof num === 'string')
                    num = num.length;
                num = typeof num !== 'number' ? 1 : num;
                this.jump(this.pos + num);
            },
            jump: function (pos) {
                this.pos = pos;
                this.char = this.input.charAt(this.pos);
            },
            touch: function (num, abs) {
                num = abs ? num : this.pos + num;
                return this.input.charAt(num);
            },
            error: function (message) {
                var lineInfo = getLineInfo(this.input, this.pos);
                var error = new Error(message + '-> line:' + lineInfo.line + '\t pos:' + lineInfo.column);
                throw error;
            },
            nextToken: function () {
                this.ws();
                var token = this.eof() || this.punctuator() || this.comment() || this.newline() || this.selector();
                if (!token) {
                    debugger;
                    this.error('Unexcept char Error');
                }
                return token;
            },
            eof: function () {
                if (this.pos >= this.length) {
                    return createToken(EOF);
                }
            },
            punctuator: function () {
                var token;
                if (token = PUNCTUATORS[this.char]) {
                    this.eat(1);
                    return token;
                }
            },
            ws: function () {
                var len = 0;
                while (isWhiteSpace(this.char)) {
                    len++;
                    this.eat(1);
                }
                if (len)
                    return createToken(WS);
            },
            comment: function () {
                if (this.char !== '/' || this.touch(1) !== '*')
                    return;
                var index = this.input.indexOf('*/', this.pos);
                if (!~index)
                    this.error('UnterminatedComment');
                var token = createToken(COMMENT);
                if (this.options.comment)
                    token.val = this.input.slice(this.pos + 2, index);
                this.jump(index + 2);
                return token;
            },
            flag: function () {
                if (this.char !== '!')
                    return;
            },
            call: function () {
            },
            atWord: function () {
            },
            atKeyword: function () {
            },
            atIdent: function () {
            },
            newline: function () {
                if (rNewLine.test(this.char)) {
                    this.eat(1);
                    console.log(this.pos);
                    return createToken(NEWLINE);
                }
            },
            url: function () {
            },
            selector: function () {
            },
            color: function () {
            },
            hex3: function () {
            },
            hex6: function () {
            },
            hex8: function () {
            },
            rgb: function () {
            },
            rgba: function () {
            },
            hsl: function () {
            },
            number: function () {
            },
            demension: function () {
            },
            percentage: function () {
            },
            string: function () {
            },
            url: function () {
            },
            _setOptions: function (token) {
            },
            _ident: function (token) {
                if (rIdentStart.test(this.char)) {
                    var str = this.char;
                }
                while (rIdentVal.test(this.touch(1))) {
                }
            }
        };
    }
}));