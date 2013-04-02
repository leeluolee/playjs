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
        var color = require('2'), util = require('3');
        var slice = [].slice, _uid = 0, tokenCache = {};
        uid = function (cached) {
            _uid++;
            if (cached) {
                tokenCache[typeof cached === 'string' ? cached : _uid] = { type: _uid };
            }
            return _uid;
        };
        var toAssert = function (str) {
            var arr = typeof str == 'string' ? str.split(/\s+/) : str, regexp = new RegExp('^(?:' + arr.join('|') + ')$');
            return function (word) {
                return regexp.test(word);
            };
        };
        var toAssert2 = util.makePredicate;
        function createToken(type, val) {
            var token = tokenCache[type] || { type: type };
            if (val)
                token.val = val;
            return token;
        }
        exports.inspectToken = function (tokenType) {
            for (var i in exports) {
                if (typeof exports[i] === 'number' && exports[i] === tokenType)
                    return i;
            }
        };
        var EOF = exports.EOF = uid(true);
        var WS = exports.WS = uid(true);
        var NEWLINE = exports.NEWLINE = uid(true);
        var COMMENT = exports.COMMENT = uid();
        var FLAG = exports.FLAG = uid();
        var IDENT = exports.IDENT = uid();
        var AT_KEYWORD = exports.AT_KEYWORD = uid();
        var SELECTOR = exports.SELECTOR = uid();
        var COLOR = exports.COLOR = uid();
        var DIMENSION = exports.DIMENSION = uid();
        var PARENL = exports.PARENL = uid('{');
        var PARENR = exports.PARENR = uid('}');
        var COMMA = exports.COMMA = uid(',');
        var COLON = exports.COLON = uid(':');
        var BRACEL = exports.BRACEL = uid('(');
        var BRACER = exports.BRACER = uid(')');
        var SEMICOLON = exports.SEMICOLON = uid(';');
        var IMPORT = exports.IMPORT = uid('import');
        var PAGE = exports.PAGE = uid('page');
        var MEDIA = exports.MEDIA = uid('media');
        var FONT_FACE = exports.MEDIA = uid('font-face');
        var CHARSET = exports.MEDIA = uid('charset');
        var VARIABLE = exports.VARIABLE = uid();
        var IF = exports.IF = uid('IF');
        var THEN = exports.THEN = uid('THEN');
        var ELSE = exports.ELSE = uid('ELSE');
        var isUnit = toAssert2('% em ex ch rem vw vh vmin vmax cm mm in pt pc px deg grad rad turn s ms Hz kHz dpi dpcm dppx');
        function alKeyword(val) {
            return tokenCache(val);
        }
        var RULES = [
                {
                    reg: /[ \t]+/,
                    action: function () {
                    }
                },
                {
                    reg: /[\n\r\f]/,
                    action: function () {
                        return createToken(NEWLINE);
                    }
                },
                {
                    reg: /\/\*([^\x00]+)\*\//,
                    action: function (yytext, val) {
                        return createToken(COMMENT, val);
                    }
                },
                {
                    reg: /@([-_A-Za-z][-\w]*)/,
                    action: function (yytext, val) {
                        return tokenCache[val] || createToken(VARIABLE, val);
                    }
                },
                {
                    reg: /([-\*_A-Za-z][-\w]*)/,
                    action: function (yytext) {
                        return createToken(IDENT, yytext);
                    }
                },
                {
                    reg: /(-?(?:\d+\.\d+|\d+))(\w*)?/,
                    action: function (yytext, val, unit) {
                        if (unit && !isUnit(unit)) {
                            this.error('Unexcept unit: "' + unit + '"');
                        }
                        var token = createToken(DIMENSION, yytext);
                        token.number = parseFloat(val);
                        token.unit = unit;
                        return token;
                    }
                },
                {
                    reg: /([\{\}\(\);,:])/,
                    action: function (yytext, punctuator) {
                        return tokenCache[punctuator];
                    }
                },
                {
                    reg: /#([0-9a-f]{3} [0-9a-f]{6})(?![#*.\[:a-zA-Z])/,
                    action: function (yytext, val) {
                        var token = createToken(val.length === 3 ? RGB : RGBA, val);
                    }
                },
                {
                    reg: /(['"])([^\r\n\f]*)\1/,
                    action: function (yytext, quote, val) {
                        return createToken(STRING, val);
                    }
                },
                {
                    reg: /[&>~+#*.\[:a-zA-Z][^\{\n\r\f,]+/,
                    action: function (yytext) {
                        return createToken(SELECTOR, yytext.trim());
                    }
                }
            ];
        function setupRule(rules, host) {
            var rule, reg, regs = [], actions = [];
            for (var i = 0; i < rules.length; i++) {
                rule = rules[i];
                reg = rule.reg;
                if (typeof reg !== 'string') {
                    reg = String(reg).slice(1, -1);
                }
                reg = new RegExp('^(?:' + reg + ')');
                action = rule.action;
                regs.push(reg);
                actions.push(action);
            }
            host.rules = regs;
            host.actions = actions;
        }
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
            this.setInput(input, options);
        }
        Tokenizer.prototype = {
            constructor: Tokenizer,
            conditions: [],
            setInput: function (input, options) {
                this.options = options || {};
                this.input = input.replace('\r\n', '\n');
                this.matched = '';
                this.remained = this.input;
                this.length = this.input.length;
                this.lineno = 0;
                this.offset = 0;
            },
            lex: function () {
                var token = this.next();
                if (typeof token !== 'undefined') {
                    return token;
                } else {
                    return this.lex();
                }
            },
            next: function () {
                var tmp, index, action, token, lines, rules = this.rules, actions = this.actions, length = rules.length;
                for (var i = 0; i < length; i++) {
                    tmp = this.remained.match(rules[i]);
                    if (tmp) {
                        index = i;
                        break;
                    }
                }
                if (tmp) {
                    lines = tmp[0].match(/(?:\r\n? \n).*/g);
                    if (lines)
                        this.lineno += lines.length;
                    action = actions[index];
                    token = action.apply(this, tmp);
                    this.remained = this.remained.slice(tmp[0].length);
                    if (token && token.type) {
                        return token;
                    }
                } else {
                    this.error();
                }
            },
            pushState: function (condition) {
            },
            popState: function () {
            },
            jump: function (pos) {
                this.pos = pos;
                this.char = this.input.charAt(this.pos);
            },
            touch: function (num, abs) {
                num = abs ? num : this.pos + num;
                return this.input.charAt(num);
            },
            error: function (message, options) {
                var message = this._traceError(message);
                var error = new Error(message || 'Lexical error');
                throw error;
            },
            _traceError: function (message) {
                return 'Lexical error on line ' + (this.lineno + 1) + (message || '. Unrecognized input.');
            }
        };
        setupRule(RULES, Tokenizer.prototype);
        var tokenizer = exports.tokenize('@hello: green;\n\n#cda.classname, .m-class{height:/***/ 80px} @hello');
        console.log(tokenizer.lex().type === NEWLINE);
        console.log(tokenizer.lex().type === NEWLINE);
        console.log(tokenizer.lex().type === NEWLINE);
        console.log(tokenizer.lex().type === SELECTOR);
        console.log(tokenizer.lex().type === COMMA);
        console.log(tokenizer.lex().type === SELECTOR);
        console.log(tokenizer.lex().type === PARENL);
        console.log(tokenizer.lex().type === IDENT);
        console.log(tokenizer.lex().type === COLON);
        console.log(tokenizer.lex());
        console.log(tokenizer.lex().type === DIMENSION);
        console.log(tokenizer.lex().type === PARENR);
        console.log(exports.inspectToken(PARENR));
    },
    '2': function (require, module, exports, global) {
        'use strict';
        var Color = module.exports = function () {
                var str = 'string', Color = function Color(r, g, b, a) {
                        var color = this, args = arguments.length, parseHex = function (h) {
                                return parseInt(h, 16);
                            };
                        if (args < 3) {
                            if (typeof r === str) {
                                r = r.substr(r.indexOf('#') + 1);
                                var threeDigits = r.length === 3;
                                r = parseHex(r);
                                threeDigits && (r = (r & 3840) * 4352 | (r & 240) * 272 | (r & 15) * 17);
                            }
                            args === 2 && (a = g);
                            g = (r & 65280) / 256;
                            b = r & 255;
                            r = r >>> 16;
                        }
                        if (!(color instanceof Color)) {
                            return new Color(r, g, b, a);
                        }
                        this.channels = [
                            typeof r === str && parseHex(r) || r,
                            typeof g === str && parseHex(g) || g,
                            typeof b === str && parseHex(b) || b,
                            typeof a !== str && typeof a !== 'number' && 1 || typeof a === str && parseFloat(a) || a
                        ];
                    }, proto = Color.prototype, undef = 'undefined', lowerCase = 'toLowerCase', math = Math, colorDict;
                Color.RGBtoHSL = function (rgb) {
                    var r = rgb[0], g = rgb[1], b = rgb[2];
                    r /= 255;
                    g /= 255;
                    b /= 255;
                    var max = math.max(r, g, b), min = math.min(r, g, b), h, s, l = (max + min) / 2;
                    if (max === min) {
                        h = s = 0;
                    } else {
                        var d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                        switch (max) {
                        case r:
                            h = (g - b) / d + (g < b ? 6 : 0);
                            break;
                        case g:
                            h = (b - r) / d + 2;
                            break;
                        case b:
                            h = (r - g) / d + 4;
                            break;
                        }
                        h /= 6;
                    }
                    return [
                        h,
                        s,
                        l
                    ];
                };
                Color.HSLtoRGB = function (hsl) {
                    var h = hsl[0], s = hsl[1], l = hsl[2], r, g, b, hue2rgb = function (p, q, t) {
                            if (t < 0) {
                                t += 1;
                            }
                            if (t > 1) {
                                t -= 1;
                            }
                            if (t < 1 / 6) {
                                return p + (q - p) * 6 * t;
                            }
                            if (t < 1 / 2) {
                                return q;
                            }
                            if (t < 2 / 3) {
                                return p + (q - p) * (2 / 3 - t) * 6;
                            }
                            return p;
                        };
                    if (s === 0) {
                        r = g = b = l;
                    } else {
                        var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1 / 3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1 / 3);
                    }
                    return [
                        r * 255,
                        g * 255,
                        b * 255
                    ];
                };
                Color.rgb = function (r, g, b, a) {
                    return new Color(r, g, b, typeof a !== undef ? a : 1);
                };
                Color.hsl = function (h, s, l, a) {
                    var rgb = Color.HSLtoRGB([
                            h,
                            s,
                            l
                        ]), ceil = math.ceil;
                    return new Color(ceil(rgb[0]), ceil(rgb[1]), ceil(rgb[2]), typeof a !== undef ? a : 1);
                };
                Color.TO_STRING_METHOD = 'hexTriplet';
                Color.parse = function (color) {
                    color = color.replace(/^\s+/g, '')[lowerCase]();
                    if (color[0] === '#') {
                        return new Color(color);
                    }
                    var cssFn = color.substr(0, 3), i;
                    color = color.replace(/[^\d,.]/g, '').split(',');
                    i = color.length;
                    while (i--) {
                        color[i] = color[i] && parseFloat(color[i]) || 0;
                    }
                    switch (cssFn) {
                    case 'rgb':
                        return Color.rgb.apply(Color, color);
                    case 'hsl':
                        color[0] /= 360;
                        color[1] /= 100;
                        color[2] /= 100;
                        return Color.hsl.apply(Color, color);
                    }
                    return null;
                };
                (Color.clearColors = function () {
                    colorDict = Color.prototype = {
                        transparent: [
                            0,
                            0,
                            0,
                            0
                        ]
                    };
                })();
                Color.define = function (color, rgb) {
                    colorDict[color[lowerCase]()] = rgb;
                };
                Color.get = function (color) {
                    color = color[lowerCase]();
                    if (Object.prototype.hasOwnProperty.call(colorDict, color)) {
                        return Color.apply(null, [].concat(colorDict[color]));
                    }
                    return null;
                };
                Color.del = function (color) {
                    return delete colorDict[color[lowerCase]()];
                };
                Color.random = function (rangeStart, rangeEnd) {
                    typeof rangeStart === str && (rangeStart = Color.get(rangeStart)) && (rangeStart = rangeStart.getValue());
                    typeof rangeEnd === str && (rangeEnd = Color.get(rangeEnd)) && (rangeEnd = rangeEnd.getValue());
                    var floor = math.floor, random = math.random;
                    rangeEnd = (rangeEnd || 16777215) + 1;
                    if (!isNaN(rangeStart)) {
                        return new Color(floor(random() * (rangeEnd - rangeStart) + rangeStart));
                    }
                    return new Color(floor(random() * rangeEnd));
                };
                proto.toString = function () {
                    return this[Color.TO_STRING_METHOD]();
                };
                proto.valueOf = proto.getValue = function () {
                    var channels = this.channels;
                    return channels[0] * 65536 | channels[1] * 256 | channels[2];
                };
                proto.setValue = function (value) {
                    this.channels.splice(0, 3, value >>> 16, (value & 65280) / 256, value & 255);
                };
                proto.hexTriplet = '01'.substr(-1) === '1' ? function () {
                    return '#' + ('00000' + this.getValue().toString(16)).substr(-6);
                } : function () {
                    var str = this.getValue().toString(16);
                    return '#' + new Array(str.length < 6 ? 6 - str.length + 1 : 0).join('0') + str;
                };
                proto.css = function () {
                    var color = this;
                    return color.channels[3] === 1 ? color.hexTriplet() : color.rgba();
                };
                proto.rgbData = function () {
                    return this.channels.slice(0, 3);
                };
                proto.hslData = function () {
                    return Color.RGBtoHSL(this.rgbData());
                };
                proto.rgb = function () {
                    return 'rgb(' + this.rgbData().join(',') + ')';
                };
                proto.rgba = function () {
                    return 'rgba(' + this.channels.join(',') + ')';
                };
                proto.hsl = function () {
                    var hsl = this.hslData();
                    return 'hsl(' + hsl[0] * 360 + ',' + hsl[1] * 100 + '%,' + hsl[2] * 100 + '%)';
                };
                proto.hsla = function () {
                    var hsl = this.hslData();
                    return 'hsla(' + hsl[0] * 360 + ',' + hsl[1] * 100 + '%,' + hsl[2] * 100 + '%,' + this.channels[3] + ')';
                };
                return Color;
            }();
        'use strict';
        (function () {
            var cssColors = {
                    aliceblue: 15792383,
                    antiquewhite: 16444375,
                    aqua: 65535,
                    aquamarine: 8388564,
                    azure: 15794175,
                    beige: 16119260,
                    bisque: 16770244,
                    black: 0,
                    blanchedalmond: 16772045,
                    blue: 255,
                    blueviolet: 9055202,
                    brown: 10824234,
                    burlywood: 14596231,
                    cadetblue: 6266528,
                    chartreuse: 8388352,
                    chocolate: 13789470,
                    coral: 16744272,
                    cornflowerblue: 6591981,
                    cornsilk: 16775388,
                    crimson: 14423100,
                    cyan: 65535,
                    darkblue: 139,
                    darkcyan: 35723,
                    darkgoldenrod: 12092939,
                    darkgray: 11119017,
                    darkgrey: 11119017,
                    darkgreen: 25600,
                    darkkhaki: 12433259,
                    darkmagenta: 9109643,
                    darkolivegreen: 5597999,
                    darkorange: 16747520,
                    darkorchid: 10040012,
                    darkred: 9109504,
                    darksalmon: 15308410,
                    darkseagreen: 9419919,
                    darkslateblue: 4734347,
                    darkslategray: 3100495,
                    darkslategrey: 3100495,
                    darkturquoise: 52945,
                    darkviolet: 9699539,
                    deeppink: 16716947,
                    deepskyblue: 49151,
                    dimgray: 6908265,
                    dimgrey: 6908265,
                    dodgerblue: 2003199,
                    firebrick: 11674146,
                    floralwhite: 16775920,
                    forestgreen: 2263842,
                    fuchsia: 16711935,
                    gainsboro: 14474460,
                    ghostwhite: 16316671,
                    gold: 16766720,
                    goldenrod: 14329120,
                    gray: 8421504,
                    grey: 8421504,
                    green: 32768,
                    greenyellow: 11403055,
                    honeydew: 15794160,
                    hotpink: 16738740,
                    indianred: 13458524,
                    indigo: 4915330,
                    ivory: 16777200,
                    khaki: 15787660,
                    lavender: 15132410,
                    lavenderblush: 16773365,
                    lawngreen: 8190976,
                    lemonchiffon: 16775885,
                    lightblue: 11393254,
                    lightcoral: 15761536,
                    lightcyan: 14745599,
                    lightgoldenrodyellow: 16448210,
                    lightgray: 13882323,
                    lightgrey: 13882323,
                    lightgreen: 9498256,
                    lightpink: 16758465,
                    lightsalmon: 16752762,
                    lightseagreen: 2142890,
                    lightskyblue: 8900346,
                    lightslategray: 7833753,
                    lightslategrey: 7833753,
                    lightsteelblue: 11584734,
                    lightyellow: 16777184,
                    lime: 65280,
                    limegreen: 3329330,
                    linen: 16445670,
                    magenta: 16711935,
                    maroon: 8388608,
                    mediumaquamarine: 6737322,
                    mediumblue: 205,
                    mediumorchid: 12211667,
                    mediumpurple: 9662680,
                    mediumseagreen: 3978097,
                    mediumslateblue: 8087790,
                    mediumspringgreen: 64154,
                    mediumturquoise: 4772300,
                    mediumvioletred: 13047173,
                    midnightblue: 1644912,
                    mintcream: 16121850,
                    mistyrose: 16770273,
                    moccasin: 16770229,
                    navajowhite: 16768685,
                    navy: 128,
                    oldlace: 16643558,
                    olive: 8421376,
                    olivedrab: 7048739,
                    orange: 16753920,
                    orangered: 16729344,
                    orchid: 14315734,
                    palegoldenrod: 15657130,
                    palegreen: 10025880,
                    paleturquoise: 11529966,
                    palevioletred: 14184595,
                    papayawhip: 16773077,
                    peachpuff: 16767673,
                    peru: 13468991,
                    pink: 16761035,
                    plum: 14524637,
                    powderblue: 11591910,
                    purple: 8388736,
                    red: 16711680,
                    rosybrown: 12357519,
                    royalblue: 4286945,
                    saddlebrown: 9127187,
                    salmon: 16416882,
                    sandybrown: 16032864,
                    seagreen: 3050327,
                    seashell: 16774638,
                    sienna: 10506797,
                    silver: 12632256,
                    skyblue: 8900331,
                    slateblue: 6970061,
                    slategray: 7372944,
                    slategrey: 7372944,
                    snow: 16775930,
                    springgreen: 65407,
                    steelblue: 4620980,
                    tan: 13808780,
                    teal: 32896,
                    thistle: 14204888,
                    tomato: 16737095,
                    turquoise: 4251856,
                    violet: 15631086,
                    wheat: 16113331,
                    white: 16777215,
                    whitesmoke: 16119285,
                    yellow: 16776960,
                    yellowgreen: 10145074
                }, color;
            for (color in cssColors) {
                if (cssColors.hasOwnProperty(color)) {
                    Color.define(color, cssColors[color]);
                }
            }
        }());
    },
    '3': function (require, module, exports, global) {
        exports.makePredicate = function (words) {
            words = words.split(' ');
            var f = '', cats = [];
            out:
                for (var i = 0; i < words.length; ++i) {
                    for (var j = 0; j < cats.length; ++j)
                        if (cats[j][0].length == words[i].length) {
                            cats[j].push(words[i]);
                            continue out;
                        }
                    cats.push([words[i]]);
                }
            function compareTo(arr) {
                if (arr.length == 1)
                    return f += 'return str === \'' + arr[0] + '\';';
                f += 'switch(str){';
                for (var i = 0; i < arr.length; ++i)
                    f += 'case \'' + arr[i] + '\':';
                f += 'return true}return false;';
            }
            if (cats.length > 3) {
                cats.sort(function (a, b) {
                    return b.length - a.length;
                });
                f += 'switch(str.length){';
                for (var i = 0; i < cats.length; ++i) {
                    var cat = cats[i];
                    f += 'case ' + cat[0].length + ':';
                    compareTo(cat);
                }
                f += '}';
            } else {
                compareTo(words);
            }
            return new Function('str', f);
        };
    }
}));