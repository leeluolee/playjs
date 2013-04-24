/**
 * 组合media query  有时候设错的条件 导致重复
 * TODO
 * 
 */


var tk = require('./tokenizer'),
    tree = require('./node/index'),
    color = require('./helper/color'),
    util = require('./helper/util');


var yy = {}; //namespace

// 判断是否是Color关键词
var isColor = util.makePredicate("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgrey darkgreen darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray grey green greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgrey lightgreen lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen")
var isNessAtKeyword = util.makePredicate('mixin extend');
var isNessFutureAtKeyword = util.makePredicate('if else then end mixin extend css');

module.exports = yy;

exports.parse = function(input, options){
    return new Parser().parse(input, options);
}

function Parser(input, options){
    // this.parse(input, options)
}

Parser.prototype = {
    //main 
    parse: function(input, options){
        this.tokenizer = tk.tokenize(input, options)
        // Temporarily ll(1) parser
        this.lookahead = null;
        this.next();
        this.states = ['accept'];
        this.state='accept';
        return this.topLevel();        
    },
    error: function(msg){
       throw Error(msg); 
    },
    next: function(){
        var next = this.tokenizer.lex();
        this.lookahead = this.tokenizer.lex();
    },
    // TODO:
    pushState:function(condition){
        this.states.push(condition);
        this.state = condition;
    },
    // TODO:
    popState:function(){
        this.states.pop();
        this.state = this.states[this.states.length-1];
    },
    match: function(tokenType, val){
        var ahead = this.ll();
        if(ahead.type !== tokenType || (val !== undefined && ahead.val !== val)) {
            this.error('at line:' + this.tokenizer.lineno + 'expect:' + tk.inspectToken(tokenType) + '->got: ' + tk.inspectToken(ahead.type));
        }else{
            this.next();
        }
    },
    // Temporarily set to ll(1) parser,
    ll: function(k){
        return this.lookahead;
    },
    // lookahead
    la: function(k){
        return this.lookahead.type;
    },
    // mark: function(){

    // },
    // release: function(){

    // },
    // expect
    // some times we need to ignored some lookahead , etc. NEWLINE
    ignore: function(tokenType, val){
        if(this.lookahead.type !== tokenType || (val && this.lookahead.val !== val)){
            this.next();
        }
    },
    // parse Function
    // ===================
    // 1.main

    // 1. grammer
    // ---------------------------------------

    // program
    //   :  stmt EOF 
    //   ;

    // stmt
    //   :  ruleset
    //   |  atrule
    //   ;


    // directive
    //   :  AT_KEYWORD 
    //   :  

    // ruleset
    //   :  assign
    //   |  rule
    //   ;  

    // atrule
    //   : import
    //   | charset 
    //   | font-face
    //   | page
    //   | KEYFRAME keyframe_block
    //   ;

    // keyframe
    //   : KEYFRAME keyframe_block
    //   ;

    // keyframe_blocks


    // import
    //   : IMPORT URL media_query_list?      :@import url('xx.js') screen 
    //   | IMPORT STRING media_query_list?      :@import url('xx.js') screen 
    //   ;

    // charset
    //   : CHARSET STRING
    //   ;

    // page
    //   : PAGE

//--------------------暂时不这么细-----------------
    // media
    //   : MEDIA media_query_list;
    //   | 
    //

    // media_query_list
    //   : media_query_list , media_query;
    //   | 

    // media_query
    //   : media_query_prefixer

    // media_query_prefixer
    //   : media_query_prefixer

    // media_query_keyword
    //   : 

    // media_query_expression
    //   : 
//------------------------------------------------------

    // rule
    //   : SELECTOR block
    //   | KEYFRAME block
    //   | MEDIA block
    //   ;

    // block
    //   : asign
    //   | mixin
    //   | 



    // mixin
    //   : MIXIN VARIABLE '(' paramlist? ')'
    //   | MIXIN VARIABLE
    //   ;


    // assign
    //   : VARIABLE COLON(:) EXPRESSION

    // parenBlock
    //     : stmt
    //     ;

    // topLevel
    //  : stmt EOF
    //  ;
    //           
    topLevel: function(){
        var node = this.node = new tree.ProgramNode();
        while(this.la(1) !== tk.EOF){
            node.body.push(this.stmt())
        }
        return node;
    },
    // stmt
    //      : declare
    //       
    stmt: function(){
        var tokenType = this.la(1);
        switch(tokenType){
        }
    },
    // declare
    //  : VAR IDENT
    //  | IDENT    // start with $
    //  ; 
    declare: function(){

    },
    expression: function(){
        var tokenType = this.la(1);
    },
    parenExpression:function(){
        this.match(tk.parenL);
        this.parse
    },

    params:function(){

    },
    definition: function(){

    }
}




