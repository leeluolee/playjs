var less = require("less");
var util = require("util");
var parser = new(less.Parser);

parser.parse('.class {@heelo:light ;width: @heelo + 1 ; height:30px; }', function (err, tree) {
    if (err) { return console.error(err) }
    console.log(util.inspect(tree.rules,null,5))
});