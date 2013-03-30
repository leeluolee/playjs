// var lexer = ness.lexer;
// test('initialize', function() {
//     var res1 = lexer("/*$hello: #fff/");
//     console.log(lexer.remaining)
//     deepEqual(res1, {type: "variable", val: "$hello"})
// })

var lexer = require("./lib/tokenizer.js");
console.log(lexer);

// $.get("data/base.less", function(text){
//     var parser = new(less.Parser);

//     parser.parse(text, function (err, tree) {
//         if (err) { return console.error(err) }
//         console.log(tree)
//         window.tree = tree;
//     });
// })