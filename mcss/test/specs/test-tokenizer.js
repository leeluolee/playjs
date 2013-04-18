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
        t.equal(token.lex().type, tk.PARENL, 'must parenL')
        t.equal(token.lex().type, tk.PARENR, 'must parenR')
        t.equal(token.lex().type, tk.BRACER, 'must BraceR')
        t.equal(token.lex().type, tk.BRACEL, 'must BraceL')
        t.equal(token.lex().type, tk.SEMICOLON, 'must SEMICOLON')
        t.equal(token.lex().type, tk.COLON, 'must COLON')
        t.equal(token.lex().type, tk.COMMA, 'must COMMA')
        t.equal(token.lex().type, tk.EOF, 'must EOF')
        t.done()

    },
    "must eat the comment\n\r": function(t){
        var token = tk.tokenize("/*hellotest*/", {
            comment: true
        })
        var next = token.lex()
        t.deepEqual(next, {type: tk.COMMENT, val: "hellotest"}, 'must comment')

    	t.done()
    },
    "must ignored the whitespace": function(t){
        var token = tk.tokenize("/*hellotest*/ {   \t}")
        token.lex(); // skip comment
        t.equal(token.lex().type, tk.PARENL, 'must parenL')
        t.equal(token.lex().type, tk.PARENR, 'skit \\t must parenR')
        t.done()
    },
    "must eat the flag": function(t){
        var token = tk.tokenize("!important/*hellotest*/ ")
        t.equal(token.lex().type, tk.IMPORTANT, 'must eat important');
        t.equal(token.lex().type, tk.COMMENT, 'must comment');
        t.equal(token.lex().type, tk.EOF, 'must hit the eof');
        t.done();
    },
    "must eat the newline": function(t){
        var token1 = tk.tokenize("\r\n");
        t.equal(token1.lex().type, tk.NEWLINE, 'must match the new line')
        t.equal(token1.lex().type, tk.EOF, 'join the \\r\\n ,so hit the eof')

        var token = tk.tokenize("\n \r \f");
        t.equal(token.lex().type, tk.NEWLINE, 'must match the new line\\n')
        t.equal(token.lex().type, tk.NEWLINE, 'must match the new line\\r')
        t.equal(token.lex().type, tk.NEWLINE, 'must match the new line\\f')
        t.equal(token.lex().type, tk.EOF, 'then hit the eof')

        t.done()
    },
    "must eat the selector": function(t){
        var selectors = selector_test.join(",");
        var token = tk.tokenize(selectors);
        var t;
        while(t = token.lex()){
            console.log(t);
            if(t == tk.EOF) break;
        }
    }

}

var selector_test = [
'div + p + p, a > p',
'div[class^=exa][class]',
'p:not(.example:nth-child(even)) a:first-child',
'body div[class$=xam], div + p > p   p a:nth-child(3n+1)',
'.title ,.toc, .toc .tocline2',
'div ~ p + p ~ p a:first-child ,div ~ p ~ p + p[class^="exm"]',
'body div p a',
'div.example[class] p:nth-child(2n):not(.toc2) span',
'body p:first-child a[href],body div.example',
'h1#title, div h1:matches(#title)',
'div.example, ul .tocline2',
'.tocline2, .tocline3, .tocline4',
'.example p , a.example',
'p:nth-child(even) a ',
'p:nth-child(2n) > a',
'p:nth-child(5n+1) a ',
'p:nth-child(-3n+11) >a',
'div.example[class] ~ p.note > strong + code.css, p.note ~ h4',
'body div, div p',
'div > p, div + p, div ~ p',
'div[class^=exa][class$=mple]',
'div p a',
'div ~ p ~ p ,div[class$=mple]',
'div, p ,div[class~=example][class][class~=example]',
'ul.toc li.tocline2, div[class=example]',
'ul.toc > li.tocline2, div[class]',
'a[href][lang][class]',
'div[class*=e]',
'div,div:not(.example[class])',
'> li.tocline2',
'+ li.tocline2',
'~ li.tocline2',
]