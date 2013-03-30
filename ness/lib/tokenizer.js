// var helper = require("./helper");

// var Flatten = helper.Flatten;

// console.log(helper)
var _uid = 1;
function uid(){
    return _uid++;
}

var PARENL = exports.PARENL = uid(); // {
var PARENR = exports.PARENR = uid(); // }
var COMMA = exports.COMMA = uid();   // ,
var COLON = exports.COLON = uid();   // :
var BRACEL = exports.BRACEL = uid(); // (
var BRACER = exports.BRACER = uid(); // )
var SEMICOLON = exports.SEMICOLON = uid(); // ;

// 使用flatten的捕获方式处理大部分词法
// var flatten = new Flatten({
//     shortcurs:{
//         digit: /[0-9]+/,
//         digit: /[1-9]+/

//     }
// }).on({
//     "ident": /([-a-zA-Z]\w*)/
//     "rgb": /rgb\((\d{1,3}\s*,\d{1,3},\d{1,3}\)/,
//     "rgb": /rgb\(\d{1,3},\d{1,3},\d{1,3}\)/,
//     // "url": //
//     // "call": //,
//     "hsl": /rgb\(\d{1,3},\d{1,3},\d{1,3}\)/,
//     "newline": /[\n\r\f]/,
//     "atWord": /@([-a-zA-Z]\w*)/
// })

// 符号
var PUNCTUATORS = {
    "{": {type: PARENL},
    "}": {type: PARENR},
    ",": {type: COMMA},
    ":": {type: COLON},
    "(": {type: BRACEL},
    ")": {type: BRACER},
    ";": {type: SEMICOLON}
}
exports.tokenize = function(input, options){
    return new Tokenizer(input, options);
}

Tokenizer = function(input, options){

    //simplify newline token detect
    this.input = input.replace("\r\n", "\n"); 
    this.remaining = input;
} 

Tokenizer.prototype = {
    constructor: Tokenizer,

    nextToken :function(){
        //1. skip whitespace
        ws()
        //2. Punctuators detect

        //
        return this.flatten() || this.selector();
    },

    //  advance functions
    // ==========================
    
    // whitespace
    ws: function(){

    },
    eat: function(word){

    },

    // flag , !import etc. 
    flag: function(){

    },
    // 处理punchor等等
    flatten: function(){
        //即将杂糅的都flatten
        return flatten.parse(input, this);
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

    // only multcomment /* [else not */] */
    comment: function(){

    },
    // new line [\n\r\f]| \r\n
    newline: function(){

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

    }
}