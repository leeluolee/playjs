var color = require('./helper/color'),
    util = require('./helper/util');


// local var or util function
var slice = [].slice,
    _uid = 0,
    tokenCache = {};
    uid = function(cached){
        _uid++;
        if(cached){
            tokenCache[typeof cached === 'string'? cached : _uid] = {type: _uid};
        }
        return _uid;
    },
    // detect keyword in word_list (@deprecated)
    toAssert = function(str){
        var arr = typeof str == "string" ? str.split(/\s+/) : str,
            regexp = new RegExp("^(?:" + arr.join("|") + ")$");

        return function(word){
          return regexp.test(word);
        }
    },
    // the more fast version
    toAssert2 = util.makePredicate;




// create Token
function createToken(type, val){
    var token = tokenCache[type] || {type: type};
    if(val) token.val = val;
    return token;
}

// Token Types
// ===========================================

// insepectToken, get tokenName with TokenType(uid)
exports.inspectToken = function(tokenType){
    for(var i in exports){
        if(typeof exports[i] === 'number' && exports[i] === tokenType) return i;
    }
}

// BASE
var EOF = exports.EOF = uid(true); // EOF
var WS = exports.WS = uid(true); // WhiteSpce
var NEWLINE = exports.NEWLINE = uid(true); // NEWLINE
var COMMENT = exports.COMMENT = uid(); // COMMENT

var IMPORTANT = exports.IMPORTANT = uid(true); // COMMENT
var IDENT = exports.IDENT = uid(); // COMMENT
var AT_KEYWORD = exports.AT_KEYWORD = uid(); // COMMENT
var SELECTOR = exports.SELECTOR = uid(); // SELECTOR
// var RGBA = exports.RGBA = uid(); // RGBA
// var RGB = exports.RGB = uid(); // RGB
var COLOR = exports.COLOR = uid(); // RGB
var DIMENSION = exports.DIMENSION = uid(); // DIMENSION

// Punctuator
var PARENL = exports.PARENL = uid('{'); // {
var PARENR = exports.PARENR = uid('}'); // }
var COMMA = exports.COMMA = uid(',');   // ,
var BRACEL = exports.BRACEL = uid('('); // (
var BRACER = exports.BRACER = uid(')'); // )
var SEMICOLON = exports.SEMICOLON = uid(';'); // ;
var BIT_AND = exports.BIT_AND = uid('&'); // ;
// beacuseof the pesudoSelector
var COLON = exports.COLON = uid(true);   // :
// AT KEYWORD

// var IMPORT = exports.IMPORT = uid('import'); // @import
// var PAGE = exports.PAGE = uid('page'); // @page
// var MEDIA = exports.MEDIA = uid('media'); // @media
// var FONT_FACE = exports.MEDIA = uid('font-face'); // @media
var AT_KEYWORD = exports.AT_KEYWORD = uid(); // @media
var DIRECTIVE = exports.DIRECTIVE = uid(); // @media
var KEYFRAME = exports.KEYFRAME = uid('keyframe'); // @media


var MIXIN = exports.MIXIN = uid('mixin'); // @media
var EXTEND = exports.EXTEND = uid('extend'); // @media


var VARIABLE = exports.VARIABLE = uid(); // @var


// NESS KEYWORD
var IF = exports.IF = uid('IF'); // @if
var THEN = exports.THEN = uid('THEN'); // @then
var VAR = exports.THEN = uid('THEN'); // @then
var ELSE = exports.ELSE = uid('ELSE'); // @else

// unit
// UNIT http://www.w3.org/TR/css3-values/
var isUnit = toAssert2("% em ex ch rem vw vh vmin vmax cm mm in pt pc px deg grad rad turn s ms Hz kHz dpi dpcm dppx");
var isAtKeyWord = toAssert2("keyframe media page import font-face")
var isNessKeyWord = toAssert2("mixin extend")
// color keywords



// alt keyword detect  @page   @import  @keyframe @media
function atKeyword(val){
    if(val === 'keyframe') return createToken(KEYFRAME)
    return tokenCache[val];
}


// FLEX simple version :) 
var RULES = [
    {   
        // EOF
        reg: /$/,
        action: function(){
            return createToken(EOF)
        }
    },
    {   //Space
        reg: /[ \t]+/,
        action: function(){
            /* skip white space */
        }
    },
    {   //NEWLINE
        reg: /[\n\r\f]/,
        action: function(){
            return createToken(NEWLINE);
        }
    },
    {   //Comment
        reg: /\/\*([^\x00]+)\*\//,
        action: function(yytext, val){
            return createToken(COMMENT, val);
        }
    },
    {
        // @  alt word or variable
        reg: /@([-_A-Za-z][-\w]*)/,
        action: function(yytext, val){
            if(val === 'keyframe' || isNessKeyWord(val)) return tokenCache[val];
            if(isAtKeyWord(val)) return createToken(AT_KEYWORD, val);
            return createToken(VARIABLE, val);
        }
    },
    {   //IDENT
        reg: /([-\*_A-Za-z][-\w]*)/,
        action: function(yytext){
            return createToken(IDENT, yytext);
        }
    },
    {   //!important
        reg: /!important/,
        action: function(yytext){
            return createToken(IMPORTANT);
        }
    },
    {   // DIMENSION NUMBER + UNIT
        //
        reg: /(-?(?:\d+\.\d+|\d+))(\w*)?/,
        action: function(yytext, val, unit){
            if(unit && !isUnit(unit)){
                this.error('Unexcept unit: "' + unit + '"');
            }
            var token = createToken(DIMENSION, yytext);
            token.number = parseFloat(val);
            token.unit = unit;
            return token;
        }
    },
    {   // PUNCTUATORS
        reg: /([\{\}\(\);,:])/,
        action: function(yytext, punctuator){
            return tokenCache[punctuator]
        }
    },
    {
        reg: /:/,
        action: function(){
            return createToken()
        }
    }
    {   // RGBA, RGB, 这里注意与selector的区分
        reg: /#([0-9a-f]{3} [0-9a-f]{6})(?![#\*.\[:a-zA-Z])/,
        action: function(yytext, val){
            var token = createToken(val.length === 3? RGB : RGBA, val);
        }
    },
    {   // String
        reg: /(['"])([^\r\n\f]*)\1/,
        action: function(yytext, quote, val){
            return createToken(STRING, val)
        }
    },
    {   // SELECTOR 模糊匹配，后期再利用[nes选择器的parser进行解析](https://github.com/leeluolee/nes)进行parse
        // 只有*，.home ,:first-child, [attr], #id  > ~ + &这几种可能的开头
        reg: /[&>~+#*.\[:a-zA-Z][^\{\n\r\f,]+/,
        action: function(yytext){
            return createToken(SELECTOR, yytext.trim())
        }
    }
]

function LexerGen = function(){

}


function setupRule(rules, host){
    var rule, reg, regs = [], actions=[];
    for(var i = 0; i< rules.length; i++){
        rule = rules[i];
        reg = rule.reg;
        if(typeof reg !== 'string'){
            reg = String(reg).slice(1, -1)
        }
        reg = new RegExp("^(?:" + reg + ")");
        action = rule.action;
        regs.push(reg)
        actions.push(action)
    }
    // 存放regexp
    host.rules = regs;
    host.actions = actions;
}




/**
 * some RegExp
 */
var nessKeyword = "mixin extend";


/**
 * exports function tokenize
 * @param  {String} input   
 * @param  {Object} options @TODO
 * @return {Tokenizer}
 */
exports.tokenize = function(input, options){
    return new Tokenizer(input, options);
}

function Tokenizer(input, options){
    this.setInput(input, options)
}


Tokenizer.prototype = {
    constructor: Tokenizer,
    conditions:[],
    setInput: function(input, options){
        // @TODO: options
        this.options = options || {};
        //simplify newline token detect
        this.input = input.replace("\r\n", "\n"); 
        // remained input
        this.remained = this.input;

        this.length = this.input.length;
        // line number @TODO:
        this.lineno = 0;
        this.offset = 0;

        // 存放规则
        this.rules = [];
        this.links = {};
        // this.rules = {'init':[]};
        // // 存放参数对应
        // this.links = {'init':[]};
        // // 存放trunks
        // this.trunks = {'init':[]};
        this.state = 'init';
    },
    on: function(rules){
        var rule, reg;
        for(var i = 0; i< rules.length; i++){
            rule = rules[i];
            reg = rule.regexp;

            if (typeof reg !== "string") {//means regexp
                rule.regexp = reg.toString().slice(1, -1)
            }

            this.rules.push(rule);

            this.rules.push(rule);
            this._setup();
        }
        return this;
    },
    _setup: function(){
        var rules = this.rules,
            links = this.links = {},
            rule, reg, state, link;
        for(var i = 0; i< rules.length; i++){
            rule = rules[i];
            reg = rule.regexp;
            state = rule.state || 'init';
            link = (links[state] || links[state] = {table:[], trunks:[]});

            link.trunks.push(reg);
        }

    },
    // 依赖next
    lex: function(){
        var token = this.next();
        if (typeof token !== 'undefined') {
          return token;
        } else {
          return this.lex();
        }
    },
    next: function(){
        var tmp, index, action, 
            token, lines,
            rules = this.rules,
            actions = this.actions,
            length = rules.length;

        for(var i = 0; i < length; i++){
            tmp = this.remained.match(rules[i]);
            if(tmp) {
              index = i;
              break
            }
        }
        if(tmp){
            lines = tmp[0].match(/(?:\r\n? \n).*/g);
            if(lines) this.lineno += lines.length;
            action = actions[index];
            token = action.apply(this, tmp);
            this.remained = this.remained.slice(tmp[0].length);

            if(token && token.type){
                return token;
            }
        }else{
            this.error()
        }
    },
    // TODO:
    pushState:function(condition){
        this.states.push(condition);
    },
    // TODO:
    popState:function(){
        this.states.pop();
    },
    /**
     * [error description]
     * @return {[type]} [description]
     */
    error: function(message, options){
        var message = this._traceError(message);
        var error = new Error(message || "Lexical error");
        throw error
    },
    _traceError: function(message){
        var matchLength = this.length - this.remained.length;
        var offset = matchLength - 10;
        if(offset < 0) offset = 0;
        var pointer = matchLength - offset;
        var posMessage = this.input.slice(offset, offset + 20)
        // TODO: 加上trace info
        return 'Error on line ' + (this.lineno + 1) + " " +
            (message || '. Unrecognized input.') + "\n" + (offset === 0? '':'...') +
            posMessage + "...\n" + new Array(pointer + (offset === 0? 0 : 3) ).join(' ') + new Array(10).join("^");
    }
   

}
// 生成actionmap
// -----------------------------------
setupRule(RULES, Tokenizer.prototype)


var tokenizer = exports.tokenize("@hello: green;\n\n#cda.classname, #abc.m-class:hover(1,3){height:/***/ 80px} @hello")

console.log(tokenizer.lex().type === VARIABLE)
console.log(tokenizer.lex().type === COLON)
console.log(tokenizer.lex().type === IDENT)
console.log(tokenizer.lex().type === SEMICOLON)
console.log(tokenizer.lex().type === NEWLINE)
console.log(tokenizer.lex().type === NEWLINE)
console.log(tokenizer.lex().type === SELECTOR)
console.log(tokenizer.lex().type === COMMA)
console.log(tokenizer.lex().type === SELECTOR)
console.log(tokenizer.lex().type === PARENL)
console.log(tokenizer.lex().type === IDENT)
console.log(tokenizer.lex().type === COLON)
console.log(tokenizer.lex())
console.log(tokenizer.lex().type === DIMENSION)
console.log(tokenizer.lex().type === PARENR)
console.log(exports.inspectToken(PARENR));
