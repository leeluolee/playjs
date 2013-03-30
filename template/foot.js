(function(){
    var t = window.t = {};
    //  tag definition


    var TAG_SECTION = {
        r: /\{\{#([\w-]+)}}[\s\S]*\{\{\/\1}}/
    }
    var TAG_VAR = {
        r: /\{\{((\{)|!|^|>})([\w-]+)}}/ 
    }
  .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
    var ESCAPE_R = /[&<>\"\']/g
    var ESCAPE_M = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }
    t.escape = function(str){
        return str.replace(ESCAPE_R, function(all){
            return 
        })
    }

    console.log(TAG_SECTION.reg.test("{{#hello}}{{/hello}}"))


})();