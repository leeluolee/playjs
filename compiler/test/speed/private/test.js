/**
 * 测试Array indexOf string
 */
function makePredicate(words) {
words = words.split(" ");
var f = "", cats = [];
out: for (var i = 0; i < words.length; ++i) {
  for (var j = 0; j < cats.length; ++j)
    if (cats[j][0].length == words[i].length) {
      cats[j].push(words[i]);
      continue out;
    }
  cats.push([words[i]]);
}
function compareTo(arr) {
  if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
  f += "switch(str){";
  for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
  f += "return true}return false;";
}

// When there are more than three length categories, an outer
// switch first dispatches on the lengths, to save on comparisons.

if (cats.length > 3) {
  cats.sort(function(a, b) {return b.length - a.length;});
  f += "switch(str.length){";
  for (var i = 0; i < cats.length; ++i) {
    var cat = cats[i];
    f += "case " + cat[0].length + ":";
    compareTo(cat);
  }
  f += "}";

// Otherwise, simply generate a flat `switch` statement.

} else {
  compareTo(words);
}
return new Function("str", f);
}

var suite = new Benchmark.Suite;

var keywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this"
var k1 = keywords.split(" ");
var k2 = makePredicate(keywords)
var k3 = {}
var k4 = new RegExp(k1.join("|"))

for(var i = 0, len = k1.length; i< len; i++){
    k3[k1[i]] = true;
}
// add tests
suite.add('Array#indexOf', function() {
    return k1.indexOf("bre") !== -1
})
.add('JST#fn', function() {
   return k2("bre");
})
.add('String#字面量直接', function() {
    if(k3["bre"]) return true
})
.add('RegExp#test', function() {
    k4.test("bre")
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  testcase2()
})
// run async
// .run({ 'async': true });

var testcase2 = (function(){
    /**
       * 2. 测试大字符串的charAt 与charCodeAt
       */
      var testString = new Array(100000).join("blablap")


      var suite2 = new Benchmark.Suite;
      suite2.add('String#charAt', function() {
          testString.charAt(25)
      })
      .add('String#charCodeAt', function() {
          testString.charCodeAt(25)
      })
      .add('String#charAt charCodeAt', function() {
         String.fromCharCode(testString.charCodeAt(25))
      })
      // add listeners
      .on('cycle', function(event) {
        console.log(String(event.target));
      })
      .on('complete', function() {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
      })
      // run async
      // .run({ 'async': true });
      return function(options){
         suite2.run(options)       
      }
})

var test3 = (function(){
  /**
   * 2. 测试String.indexOf与RegExp.test
   */
  var rwhitespace = /[\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF]/;
  var swhitespace = '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF';
  var createWordTestFromSequence = function(str){
    var regexp = new RegExp("^(?:"+str.split(" ").join("|")+")$");
    return function(word){
      return regexp.test(word)
    }
  }

  var isReservedWord3 = createWordTestFromSequence("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile");

  // ECMAScript 5 reserved words.

  var isReservedWord5 = createWordTestFromSequence("class enum extends super const export import");

  // The additional reserved words in strict mode.

  var isStrictReservedWord = createWordTestFromSequence("implements interface let package private protected public static yield");

  // The forbidden variable names in strict mode.

  var isStrictBadIdWord = createWordTestFromSequence("eval arguments");

  // And the keywords.

  var isKeyword = createWordTestFromSequence("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this");

  var suite = new Benchmark.Suite;

  suite.add('RegExp#test', function() {
    isKeyword("bre")
    isKeyword("break")
  })
  .add('String#indexOf', function() {
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })

  return suite.run.bind(suite)
})();

// @test_template
var test_template = (function(){
  /**
   * 2. 测试String.indexOf与RegExp.test
   */

  var suite = new Benchmark.Suite;

  suite.add('String#charAt', function() {
      testString.charAt(25)
  })
  .add('String#charCodeAt', function() {
      testString.charCodeAt(25)
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })

  return suite.run.bind(suite)
})();

var test4 = (function(){
  /**
   * 2. 测试String.indexOf与RegExp.test
   */

  var suite = new Benchmark.Suite;
  var testString = "daaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"

  suite.add('String#charAt', function() {
      testString.charAt(25)
  })
  .add('String#charCodeAt', function() {
      testString.charCodeAt(25)
  })
  // add listeners
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })

  return suite.run.bind(suite)
})();
test4()



