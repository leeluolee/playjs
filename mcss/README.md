function makePredicate(words) {
    words = words.split(/\s*,\s*|\s+/);
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
      if (arr.length == 1) return f += "return str === '" + String(arr[0]) + "';";
      f += "switch(str){";
      for (var i = 0; i < arr.length; ++i) f += "case '" + String(arr[i]) + "':";
      f += "return true}return false;";
    }
    if (cats.length > 3) {
      cats.sort(function(a, b) {return b.length - a.length;});
      f += "switch(str.length){";
      for (var i = 0; i < cats.length; ++i) {
        var cat = cats[i];
        f += "case " + cat[0].length + ":";
        compareTo(cat);
      }
      f += "}";
 
    } else {
      compareTo(words);
    }
    return new Function("str", f);
  }

  // USER
var testKeyWord = makePredicate('DISTINCT EXCEPT, EXISTS, FROM, FOR, FALSE, GROUP, HAVING, INNER, INTERSECT, IS, LIKE, MINUS, NOT, NULL, ON, ORDER, PRIMARY, TRUE, UNION, WHERE');

testKeyWord('DISTINCT')// => true