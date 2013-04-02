var slice = [].slice;



/**
 * simple uid generator
 * @type {Number}
 */
var _uid = 0, tokenCache = {};
function uid(cached){
    _uid++;
    if(cached){
        tokenCache[typeof cached === 'string'? cached : _uid] = {type: _uid};
    }
    return _uid;
}



/**
 * 剽窃自acorn(目前最快的JS in JS Parser)的做法, 只在需要时提供lineNumber
 * @return {[type]} [description]
 */
function getLineInfo(input, offset){
    // line下标从1开始
    for (var line = 1, cur = 0;;) {
      rLineBreak.lastIndex = cur;
      var match = rLineBreak.exec(input);
      // 当index小于offset继续进行匹配
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else break;
    }
    return {line: line, column: offset - cur};
}
// 判断某词是否在关键字列表中为关键字, regexp版
function toAssert(str){
    var arr = typeof str == "string" ? str.split(/\s+/) : str,
        regexp = new RegExp("^(?:" + arr.join(" ") + ")$");

    return function(word){
      return regexp.test(word);
    }
}


// create Token
function createToken(type, val){
    return tokenCache[type]    {type: type, val: val};
}

/**
 * token types with uid
 * @type {[type]}
 */
var EOF = exports.EOF = uid(true); // EOF
var WS = exports.WS = uid(true); // WhiteSpce
var NEWLINE = exports.NEWLINE = uid(true); // NEWLINE
var COMMENT = exports.COMMENT = uid(); // COMMENT

var FLAG = exports.FLAG = uid(); // COMMENT
var IDENT = exports.IDENT = uid(); // COMMENT
var AT_KEYWORD = exports.AT_KEYWORD = uid(); // COMMENT
var SELECTOR = exports.SELECTOR = uid(); // SELECTOR
var RGBA = exports.RGBA = uid(); // RGBA
var RGB = exports.RGB = uid(); // RGB
var DIMENSION = exports.DIMENSION = uid(); // DIMENSION

// Punctuator
var PARENL = exports.PARENL = uid('{'); // {
var PARENR = exports.PARENR = uid('}'); // }
var COMMA = exports.COMMA = uid(',');   // ,
var COLON = exports.COLON = uid(':');   // :
var BRACEL = exports.BRACEL = uid('('); // (
var BRACER = exports.BRACER = uid(')'); // )
var SEMICOLON = exports.SEMICOLON = uid(';'); // ;

// NESS KEYWORD

var IF = exports.IF = uid('IF'); // @if
var THEN = exports.THEN = uid('THEN'); // @then
var ELSE = exports.ELSE = uid('ELSE'); // @else

// var FOR = exports.FOR = uid('FOR'); // @if
// var BY = exports.BY = uid('BY'); // @then
// var ELSE = exports.ELSE = uid('ELSE'); // @else

// unit
// UNIT http://www.w3.org/TR/css3-values/
var isUnit = toAssert("% em ex ch rem vw vh vmin vmax cm mm in pt pc px deg grad rad turn s ms Hz kHz dpi dpcm dppx");
// TODO
var isCSSKeyword = toAssert("")
// TODO
var isNESSKeyword = toAssert("")

// FLEX SIMPLE 版, :)
var RULES = [
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
            return createToken(COMMENT, yytext);
        }
    },
    {
        // @alt word
        reg: /@([-\*_A-Za-z][-\w]*)/,
        action: function(yytext, val){
            if(isAtKeyWord(val)){
                return createToken(AT_KEYWORD)
            }else if(isNes){
                return createToken(NES_KEYWORD)
            }
        }
    },
    {   //IDENT
        reg: /([-\*_A-Za-z][-\w]*)/,
        action: function(yytext, val){
            return createToken(IDENT, val)
        }
    },
    {   // DIMENSION NUMBER + UNIT
        //
        reg: /(-?(?:\d+\.\d+ \d+))()?/,
        action: function(yytext, val, unit){
            var token = createToken(UNIT, )
            createToken()
        }
    },
    {   
        reg: 
    }
    {   // PUNCTUATORS
        reg: /([\{\}\(\);,:])/,
        action: function(yytext, punctuator){
            return tokenCache[punctuator]
        }
    },
    {   // rgba, rgb,
        reg: /#([0-9a-f]{3} [0-9a-f]{6})(?![#*.\[:a-zA-Z])/,
        action: function(yytext, val){
            return createToken(val.length === 3? RGB : RGBA, val);
        }
    },
    {   // String
        reg: /(['"])([^\r\n\f]*)\1/,
        action: function(yytext, quote, val){
            return createToken(STRING, val)
        }
    },
    {   // SELECTOR 模糊匹配，后期再再利用[nes选择器的parser进行解析](https://github.com/leeluolee/nes)进行parse
        // 只有*，.home ,:first-child, [attr], #id 这几种可能的开头
        reg: /[#*.\[:a-zA-Z][^\{\n\r\f,]+/,
        action: function(yytext){
            return createToken(SELECTOR, yytext.trim())
        }
    }
]

function setupRule(rules, host){
    var rule, reg, regs = [], actions=[];
    for(var i = 0; i< rules.length; i++){
        rule = rules[i];
        reg = rule.reg;
        if(typeof reg !== 'string'){
            reg = String(reg).slice(1, -1)
        }
        reg = new RegExp("^(?:" + reg + ")");
        action = rule.action    null;
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
var cssKeyWord = "keyframe media page import";


var rNewLine = /[\n\r\f]/;
var rLineBreak = /\r\n [\n\r\f]/g;
var rIdentStart = /^[-a-zA-Z_]/;
var rIdentVal = /^[-\w]/;

/**
 * detect WhiteSpace 
 * @param  {[type]}  char [description]
 * @return {Boolean}      [description]
 */
var isWhiteSpace = function(char){
    return char === '\t'    char === ' ';
}

var isAtKeyWord = toAssert(nessKeyword + " " + cssKeyWord);

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
        this.options = options    {};
        //simplify newline token detect
        this.input = input.replace("\r\n", "\n"); 
        // matched input
        this.matched = '';
        // remained input
        this.remained = this.input;
        this.length = this.input.length;
        // line number @TODO:
        this.lineno = 0;
        this.offset = 0;
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

    },
    // TODO:
    popState:function(){

    },
    // jump to absolute position
    jump: function(pos){
        this.pos = pos;
        this.char = this.input.charAt(this.pos);
    },
    /**
     * look around with num
     * @param  {Number} num  
     * @param  {[type]} back 
     *         0: relative
               1: absolute
     */
    touch: function(num, abs){
        num = abs ? num : this.pos + num;
        // TODO
        // if(num < 0    num > this.length) return null;
        return this.input.charAt(num)
    },
    /**
     * [error description]
     * @return {[type]} [description]
     */
    error: function(message, options){
        var message = this._traceError(message);
        var error = new Error(message    "Lexical error");
        throw error
    },
    _traceError: function(message){
        // TODO: 加上trace info
        return 'Lexical error on line ' + (this.lineno + 1) + 
            (message    '. Unrecognized input.')
    }
   

}
// 生成actionmap
setupRule(RULES, Tokenizer.prototype)


var tokenizer = exports.tokenize("\n\n#cda.classname, .m-class{height: 80px}")
console.log(tokenizer.lex().type === NEWLINE)
console.log(tokenizer.lex().type === NEWLINE)
console.log(tokenizer.lex().type === SELECTOR)
console.log(tokenizer.lex().type === COMMA)
console.log(tokenizer.lex().type === SELECTOR)
console.log(tokenizer.lex().type === PARENL)
console.log(tokenizer.lex().type === IDENT)
console.log(tokenizer.lex().type === COLON)
console.log(tokenizer.lex().type === COLON)
console.log(tokenizer.lex().type === BRACER)
