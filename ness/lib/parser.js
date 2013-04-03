
/**
 * 组合media query  有时候设错的条件 导致重复
 * 
 */


var tk = require('./tokenizer'),
    tree = require('./node/index'),
    color = require('./helper/color'),
    util = require('./helper/util');

// 判断是否是Color关键词
var isColor = util.makePredicate("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgrey darkgreen darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray grey green greenyellow honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgrey lightgreen lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen")
var isNessAtKeyword = util.makePredicate('if else then end mixin extend css');


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
        this.tokens = [];
        this.next();
        return this.topLevel();        
    },
    error: function(msg){
       throw Error(msg); 
    },
    next: function(){
        this.token = this.tokenizer.lex()
    },
    // expect
    advance: function(tokenType, val){
        if(this.token.type !== tokenType || (val && this.token.val !== val)){
            this.error("expect " + this.tokenizer.inspectToken(tokenType) + ", got the type:" + this.tokenizer.inspectToken(this.token.type));
        }
        this.next();
    },
    // some times we need to ignored some token , etc. NEWLINE
    ignore: function(tokenType, val){
        if(this.token.type !== tokenType || (val && this.token.val !== val)){
            this.next();
        }
    },
    // parse Function
    // ===================
    // 1.main

    // 1. grammer
    // ---------------------------------------

    // program
    //   : stmt EOF 
    //   ;

    // stmt
    //   :  ruleset
    //   |  atrule
    //   ;

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



    topLevel: function(){
        var node = new tree.ProgramNode()
        while(this.token.type !== tk.EOF){
            console.log(tk.inspectToken(this.token.type), tk.EOF)
            node.body.push(this.stmt())
        }
        return node;
    },
    // 2.
    stmt: function(){
        console.log("stmt")
        var tokenType = this.token.type
        this.next();
    },
    // 
    rule:function(){

    },
    definition:function(){

    }
}


console.log(exports.parse("@height:80px;"))


