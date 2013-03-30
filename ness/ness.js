// ;(function(name, def) {
//     // amd
//     if (typeof define === "function" && define.amd) define(["exports"], def);
//     // nodejs or global
//     else def(typeof exports === "undefined" ? (self[name] = {}) : exports);

// })("lexer", function(exports) {
//     /**
//      * [lexer description]
//      * @param  {[type]} input   [description]
//      * @param  {[type]} options [description]
//      *
//      *          rule: false           - mark the rule
//      *          location: false       - mark the location 
//      *
//      * @return {[type]}         [description]
//      */
//     var lexer = function(){

//     }

//     var 
//         Expressions = {
//             UnterminatedComment: "Unterminated Comment",
//             SyntaxError: ""
//         }
//     /**
//      * Util functions
//      * ================================
//      */

//     function extend(o1, o2){
//         for(var i in o2) if(o1[i] !== undefined){
//             o1[i] = o2[i];
//         }
//         return o1;
//     }

//     // 判断某词是否在关键字列表中为关键字, RegExp版
//     var toAssert = function(str){
//         var arr = typeof str == "string" ? str.split(/\s+/) : str,
//             regexp = new RegExp("^(?:" + arr.join("|") + ")$");

//         return function(word){
//             return regexp.test(word);
//         }
//     }




//     /**
//      * LEXEL
//      * =================================
//      */

//     // 1. definition
//     // ----------------------------------------------

//     function isIdentCharStart(char){
//         return /[_a-zA-Z]/.test(char)
//     }
//     function isIdentChar(char){
//         return /[-\w]/.test(char)
//     }

//     function isWhiteSpace(char){
//         return /[ \t]/.test(char)
//     }



//     var Punchors = {
//         "(": {type:"parenL"},
//         ")": {type:"parenR"},
//         ",": {type:"comma"},
//         "{": {type:"braceL"},
//         "}": {type:"braceR"},
//         ";": {type:"semi"},
//         ":": {type:"colon"},
//         ">": {type:"gt"},
//         "@": {type:"at"},
//         "newline": {type:"newline"},
//     }

//     exports.lexer = function(input, options){
//         var tokenizer = new Tokenizer(input, options);
//         var tokens = [];
//         while((nextToken = tokenizer.nextToken()) !== "eof"){
//             tokens.push(nextToken)
//         }
//         return tokens

//     }

//     function Tokenizer(input, options){
//         this.input = input.replace("\r\n", "\n");
//         this.length = input.length;
//         this.tokens = [];
//     }

//     Tokenizer.prototype = {
//         constructor: Tokenizer,
//         nextToken: function(){
//             var input = this.input;
//             this._skipWS(); //whitespace
//             if(this.pos >= this.length) return this.token('eof');
//             this.cur = input.charCodeAt(this.pos);
//             return this._comment() || 
//                 this._punchor() ||
//                 this._
//         },
//         token: function(type, val){
//             return token.cache[val] || {type:name, val: val}
//         },
//         eat: function(num){
//             if(typeof num === "string") num = num.length
//             this.pos += (num || 1);
//             return this;
//         },
//         _ident:function(){

//         },
//         _function: function(){

//         },
//         // @backgroundColor
//         _altWord:function(){

//         },
//         // @media  
//         _altKeyword:function(){

//         },
//         _punchor: function(){
//         },
//         // skip white space
//         _skipWS:function(){
//             while(isWhiteSpace(char)){
//                 this.eat();
//             }
//         },
//         _comment: function(){
//             var index = this.input.indexOf("*/", this.pos);
//             if(!~index) error("UnterminatedComment");
//             this.next(index + 2);
//             return 
//         },
//         _newLine: function(){
//             if(/^[\r\n\f]/.test(this.cur)){
//                 return this.token("newline")
//             }
//         },
//         // @
//         _atRule: function(){

//         },
//         _declaration: function(){

//         },
//         _punchor: function(){

//         },
//         _selector: function(){

//         }
//     }

//     function error(type){
//         throw Error(Expressions["type"] || type)
//     }

//     var Scope = {};
//     Scope.currentScope = null;
//     // implement Scope
//     function Rule(outerScope, selector){
//         this.table = {}
//         this.outerScope = outerScope;
//     }


//     Rule.prototye = {
//         push: function(){
//             Scope.currentScope = this;
//         },
//         pop: function(){
//             Scope.currentScope = this.outerScope;
//         },
//         getOuterScope: function(){
//             return this.outerScope;
//         },
//         def: function(name, symbol){
//             this.tables[name] = symbol
//         }
//     }
//     exports.lexer = lexer;
//     /**
//      * Scope
//      */
//     function Scope(){
//         // mixin  table
//         this.mixinTable = {};
//         //
//         this.varTable = {};
//     }
//     Scope.prototype = {
//     }
// })

// if(typeof exports === undefined){
//     var ness = exports =={}
// } 


