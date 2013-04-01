/**
 * simple uid generator
 * @type {Number}
 */
var _uid = 1;
function uid(){
    return _uid++;
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
        regexp = new RegExp("^(?:" + arr.join("|") + ")$");

    return function(word){
      return regexp.test(word);
    }
}



function createToken(type, val){
    return {type: type, val: val};
}

/**
 * token types with uid
 * @type {[type]}
 */
var EOF = exports.EOF = uid(); // EOF
var WS = exports.WS = uid(); // WhiteSpce
var NEWLINE = exports.NEWLINE = uid(); // NEWLINE
var COMMENT = exports.COMMENT = uid(); // COMMENT

var FLAG = exports.FLAG = uid(); // COMMENT

// Punctuator
var PARENL = exports.PARENL = uid(); // {
var PARENR = exports.PARENR = uid(); // }
var COMMA = exports.COMMA = uid();   // ,
var COLON = exports.COLON = uid();   // :
var BRACEL = exports.BRACEL = uid(); // (
var BRACER = exports.BRACER = uid(); // )
var SEMICOLON = exports.SEMICOLON = uid(); // ;

/**
 * Punctuators collections
 * avoid create mult times
 * @type {[type]}
 */
var PUNCTUATORS = {
    "{": {type: PARENL},
    "}": {type: PARENR},
    ",": {type: COMMA},
    ":": {type: COLON},
    "(": {type: BRACEL},
    ")": {type: BRACER},
    ";": {type: SEMICOLON}
}



/**
 * some RegExp
 */
var nessKeyword = "mixin extend";
var cssKeyWord = "keyframe media page import";


var rNewLine = /[\n\r\f]/;
var rLineBreak = /\r\n|[\n\r\f]/g;
var rIdentStart = /^[-a-zA-Z_]/;
var rIdentVal = /^[-\w]/;

/**
 * detect WhiteSpace 
 * @param  {[type]}  char [description]
 * @return {Boolean}      [description]
 */
var isWhiteSpace = function(char){
    return char === '\t' || char === ' ';
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
    // TODO: options
    this.options = options || {};
    //simplify newline token detect
    this.input = input.replace("\r\n", "\n"); 
    this.length = this.input.length;
    this.pos = 0;
    this.char = this.input[0];
} 

Tokenizer.prototype = {
    constructor: Tokenizer,

    eat: function(num){
        if(typeof num === 'string') num = num.length;
        num = typeof num !== 'number'? 1 : num;
        this.jump(this.pos + num);
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
        // if(num < 0 || num > this.length) return null;
        return this.input.charAt(num)
    },
    /**
     * [error description]
     * @return {[type]} [description]
     */
    error: function(message){
        var lineInfo = getLineInfo(this.input, this.pos);
        var error = new Error(message + "-> line:" + lineInfo.line + "\t pos:" + lineInfo.column);
        throw error
    },
    /**
     * 最重要的exports function, 取得下一个token
     * @return {[type]} [description]
     */
    nextToken :function(){
        this.ws()
        var token = this.eof() ||
            this.punctuator() || 
            this.comment() ||
            this.newline() ||
            this.selector();
        if(!token){
            debugger
            this.error("Unexcept char Error")
        }
        return token;

    },

    //  advance functions
    // ==========================

    // eof
    eof: function(){
        if(this.pos >= this.length){
            return createToken(EOF)
        }
    },
    // punctuator matcher
    punctuator: function(){
        var token;
        if(token = PUNCTUATORS[this.char]){
            this.eat(1);
            return token;
        }
    },
    // whitespace
    ws: function(){
        var len = 0
        while(isWhiteSpace(this.char)){
            len++
            this.eat(1);
        }
        if(len) return createToken(WS);
    }, 
    // only multcomment /* all but not */ */
    comment: function(){
        if(this.char !== '/' || this.touch(1)!== '*') return;
        var index = this.input.indexOf("*/", this.pos);
        if(!~index) this.error("UnterminatedComment");
        var token = createToken(COMMENT)
        if(this.options.comment) token.val = this.input.slice(this.pos + 2, index);
        this.jump(index + 2);
        return token;

    },
    // flag , !import etc. 
    flag: function(){
        if(this.char !== '!') return;

    },
    // function call
    call: function(){

    },
    // @import @atIdent
    atWord: function(){

    },
    atKeyword: function(){

    },
    atIdent: function(){

    },

    // new line [\n\r\f]| \r\n
    newline: function(){
        if(rNewLine.test(this.char)){
            this.eat(1);
            console.log(this.pos)
            return createToken(NEWLINE)
        }
    },

    url: function(){

    },
    // 只捕获不处理，后续可以使用nes进行处理
    selector: function(){

    },
    // color
    // ----------
    // 1. hex3
    // 2. hex6
    // 3. hex8
    // 4. rgb()
    // 5. rgba()
    // 6. hsl()
    color: function(){

    },        
    hex3: function(){

    },
    hex6: function(){

    },
    hex8: function(){

    },
    rgb: function(){

    },
    rgba: function(){

    },
    hsl: function(){

    },

    // number
    // ----------
    number: function(){

    },
    demension: function(){

    },
    percentage: function(){

    },

    // "Microsoft Yahei"
    string: function(){

    },
    // ident:url(url)
    url: function(){

    },
    // private 
    _setOptions: function(token){

    },
    // 多个地方需要readIdent
    _ident: function(token){
        if(rIdentStart.test(this.char)){
            var str = this.char 
        }
        while(rIdentVal.test(this.touch(1))){

        }
    }
}