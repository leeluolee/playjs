if(typeof require !== 'undefined') var ness = require('../../lib/index.js')
var tk = ness.tokenizer

Function.prototype.perf = function(times, args){
    var date = +new Date;
    for(var i = 0; i < times; i++){
        this.apply(this, args || []);
    }
    console.log(+new Date - date, this.name);
}


// test1. charCode 速度原高于index

// var str = new Array(1000000).join('ajdskjd');
// var index = 1000
// ;(function index(){
//     str[index++]
// }).perf(100000)
// index = 1000
// ;(function charAt(){
//     str.charAt(index++)
// }).perf(100000)

this.tokenizer = {
    "punctor list must return": function(t){
        var token = tk.tokenize("{})(;:,")
        t.equal(token.nextToken().type, tk.PARENL, 'must parenL')
        t.equal(token.nextToken().type, tk.PARENR, 'must parenR')
        t.equal(token.nextToken().type, tk.BRACER, 'must BraceR')
        t.equal(token.nextToken().type, tk.BRACEL, 'must BraceL')
        t.equal(token.nextToken().type, tk.SEMICOLON, 'must SEMICOLON')
        t.equal(token.nextToken().type, tk.COLON, 'must COLON')
        t.equal(token.nextToken().type, tk.COMMA, 'must COMMA')
        t.equal(token.nextToken().type, tk.EOF, 'must EOF')
        t.done()

    },
    "must eat the comment\n\r": function(t){
        var token = tk.tokenize("/*hellotest*/", {
            comment: true
        })
        var next = token.nextToken()
        t.deepEqual(next, {type: tk.COMMENT, val: "hellotest"}, 'must comment')

    	t.done()
    },
    "must ignored the whitespace": function(t){
        var token = tk.tokenize("/*hellotest*/ {   \t}")
        token.nextToken(); // skip comment
        t.equal(token.nextToken().type, tk.PARENL, 'must parenL')
        t.equal(token.nextToken().type, tk.PARENR, 'skit \\t must parenR')
        t.done()
    },
    "must eat the flag": function(t){
        var token = tk.tokenize("!important/*hellotest*/ ")
        token.nextToken(); // skip comment
        t.equal(token.nextToken().type, tk.FLAG, 'must eat flag');
        t.equal(token.nextToken().type, tk.COMMENT, 'must comment');
        t.done();
    },
    "must eat the newline": function(t){
        var token1 = tk.tokenize("\r\n");
        t.equal(token1.nextToken().type, tk.NEWLINE, 'must match the new line')
        t.equal(token1.nextToken().type, tk.EOF, 'join the \\r\\n ,so hit the eof')

        var token = tk.tokenize("\n \r \f");
        t.equal(token.nextToken().type, tk.NEWLINE, 'must match the new line\\n')
        t.equal(token.nextToken().type, tk.NEWLINE, 'must match the new line\\r')
        t.equal(token.nextToken().type, tk.NEWLINE, 'must match the new line\\f')
        t.equal(token.nextToken().type, tk.EOF, 'then hit the eof')

        t.done()
    }

}