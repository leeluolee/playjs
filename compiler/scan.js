//最无聊的就是看ecmascript spec... 但是确实解答了  很多以前困惑的问题，比如分号自动插入发生在什么条件下，看完准备写个JS parser 巩固下知识，也算是顺便锻炼下未赶上的计算机基础科目
// 写完js的集中式学习就告一段落了，该学习下新语言
// 感谢:
// 1. http://es5.github.com/#x5
// 2. https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
// 3. esprima、uglifyJs
// 4. 编程语言实现模式(这本号称最简单的前端编译知识都看得我半死,我果然是苦逼的非科班)

;(function(name, def) {
    // amd
    if (typeof define === "function" && define.amd) define(["exports"], def);
    // nodejs or global
    else def(typeof exports === "undefined" ? (self[name] = {}) : exports);

})("scan", function(exports) {
    // http://es5.github.com/#x7
    // 为了区分 /= /  与RegExp 这里根据context 有两种不同的InputElement
    // 分别为 division 与 regexp
    var fromCharCode = String.fromCharCode;


    // 判断某词是否在关键字列表中为关键字, RegExp版
    var toAssert = function(str){
        var arr = typeof str == "string" ? str.split(/\s+/) : str,
            regexp = new RegExp("^(?:" + arr.join("|") + ")$");

        return function(word){
          return regexp.test(word);
        }
    }

    // 判断某词是否在关键字列表中为关键字
    var toAssert2 = function(str){
        var arr = typeof str == "string" ? str.split(/\s+/) : str;
        var length = arr.length;

        return function(code){
            for(var i = 0; i < length; i++){
                if(code === arr[i]) return true;
            }
            return false;
        }

    }

    // 1.1 WhiteSpace
    // ================================

    // \u0009 Tab <TAB>
    // \u000B Vertical Tab <VT>
    // \u000C Form Feed <FF>
    // \u0020 Space <SP>
    // \u00A0 No-break space <#x0a>
    // \uFEFF     <BOM>
    // other unicode

    var isWhiteSpace = toAssert2([9, 11, 12, 32, 160, 0xFEFF]);


    // 1.1 LineTerminal
    // ================================
    // http://es5.github.com/#x7.3
    // \u000A Line Feed <LF> \n
    // \u000D Carriage Return <CR> \r
    // \u2028 Line separator <LS> 
    // \u2029 Paragraph separator <PS> 
    var isLineTerminal = toAssert2([10, 13, 0x2028, 0x2029]);
    // 如果前一个是CR 则下一个LF 不视为一个lineTerminalSeq  CRLF的组合也算
    // var isLineTerminalSeq = function(){}

    // 1.3 Comment
    // =====================================

    // Syntax http://es5.github.com/#x7.4
    // 要点:

    // 1. Single Line Comment 以 LineTerminalSeq为终点 
    //      做法: 单行由于没有String.indexOf(RegExp) 只能逐一查找
    // 2. 如果一个 MultiLineComment 包含一个 LineTerminal 则这个Comment被视为是一个LineTerminal
    //      做法: 多行直接indexOf("*/"), -1 则说明没有闭合
    // 

    // TODO:明天再做


    // 1.4 Tokens
    // http://es5.github.com/#x7.5
    // Token ::
    // IdentifierName
    // Punctuator
    // NumericLiteral
    // StringLiteral

    // 关键点是Punctuator


    // 1.5 IdentifierNames and Identifier
    // 要点:
    // 1. [An Identifier is an IdentifierName but not ReservedWord](http://es5.github.com/#x5.1.6)
    // 2. 可能与其他语言不同的是$与_是permitted在IdentifierName的任何位置(jquery与underscore为什么火?)
    // 3. \uxxxx也是允许的 http://es5.github.com/#x7.8.4 中有说明, 其中的 __CV__ 应该是compulte value的意思? TODO
    // 4. a Unicode escape sequence occurring within a comment is never interpreted and therefore cannot contribute to termination of the comment js中的注释的unicode不能贡献terminal end
    // 5. Similarly, a Unicode escape sequence occurring within a string literal in an ECMAScript program always contributes a character to the String value of the literal 
    //    and is never interpreted as a line terminator or as a quote mark that might terminate the string literal.同样的在字符串中,只会贡献一个字符 但是不会解释成换行或者其他导致字符串结束的
    // 6. acorn,esprima 都有BUG acorn.parse("'ada\u000aa'") =》报错，chrome下则不报错(这个问题确实没法做) ,原因即是上面两条: acorn.parse('"\u0022"')同样引号也报错 误以为结束

    // from esprima
    var NonAsciiIdentifierStart = new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]');
    var NonAsciiIdentifierPart = new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]');

    // Identifier ::
    // IdentifierName but not ReservedWord

    // IdentifierName ::
    // IdentifierStart
    // IdentifierName IdentifierPart

    // IdentifierStart ::
    // UnicodeLetter
    // $
    // _ 
    // \ UnicodeEscapeSequence

    // IdentifierPart ::
    // IdentifierStart
    // UnicodeCombiningMark
    // UnicodeDigit
    // UnicodeConnectorPunctuation
    function isIdentifierStart(code){
        return (ch === 36) || (code === 95) ||// $ _
            (code > 64 && code < 91) ||         // A-Z
            (code > 96 && code < 123) ||        // a-z
            (code >= 0xaa) && NonAsciiIdentifierStart.test(String.fromCharCode(code));
    }

    function isIdentifierPart(code){
        return (code === 36) || (code === 95) ||
            (code > 64 && code < 91) ||        
            (code > 96 && code < 123) ||        
            (code > 48 && code < 58) ||        // 0-9
            (code >= 0xaa) && NonAsciiIdentifierPart.test(fromCharCode(code));

    }


    // 1.7 Reverse Words
    // http://es5.github.com/#x7.6.1

    var FutureReversedWord = "class enum extends super const export import";
    var strictFutureReverseWord = FutureReversedWord + " implements let private public yield interface package protected static"
    var isKeyWord = toAssert("break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try")
    var isFutureReversedWord = toAssert(FutureReversedWord);
    // 这里只有开启了 strict mode code 才会成为保留字 错误与上面一知
    var isStrictFutureReverseWord = toAssert(strictFutureReverseWord);


    // 1.8 Punctuator 符号
    // http://es5.github.com/#x7.7
    // 1. 分为Punctuator 与 DivPunctuator


    // 1.9 Literals 字面量
    // 1. null: null 
    // 2. bool: true false

    // 3. number: http://es5.github.com/#x7.8.3
    // 这里有个MV(mathematical value)的概念，即会将值进行先行计算(@TODO:建议这里先做个参数)
    // 列举注意__opt__
    // NumericLiteral ::
    // DecimalLiteral  > 1.2
    // HexIntegerLiteral   > 0x1111
    // OctalIntegerLiteral 如果不是strict mode  这个是允许的

    // DecimalLiteral ::
    // DecimalIntegerLiteral . DecimalDigitsopt ExponentPartopt   1.2e+30
    // . DecimalDigits ExponentPartopt                            .3e+30
    // DecimalIntegerLiteral ExponentPartopt                      1e+30

    // DecimalIntegerLiteral ::
    // 0                                                          0
    // NonZeroDigit DecimalDigitsopt                              11、1(但是不能是01e+30, 01是可以的(这时候代表的是8进制数，但是strict moe不能使用 [@REF](http://es5.github.com/#B.1.1), acorn BUG,esprima没有bug, 按规范貌似acorn对啊)

    // DecimalDigits ::                                           十进制数
    // DecimalDigit                                               0
    // DecimalDigits DecimalDigit                                 

    // DecimalDigit :: one of
    // 0 1 2 3 4 5 6 7 8 9

    // NonZeroDigit :: one of
    // 1 2 3 4 5 6 7 8 9

    // ExponentPart ::
    // ExponentIndicator SignedInteger

    // ExponentIndicator :: one of
    // e E

    // SignedInteger ::
    // DecimalDigits
    // + DecimalDigits
    // - DecimalDigits

    // HexIntegerLiteral ::
    // 0x HexDigit
    // 0X HexDigit
    // HexIntegerLiteral HexDigit

    // HexDigit :: one of
    // 0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F



    // 1.10 String   @WARN: node中fs 读出来的 字符序列, 以及ajax获取等等，只要不是String 字面量创建的String 都不会转义\
    // http://es5.github.com/#x7.8.4
    // 定义:
    // 
    // StringLiteral ::
    // " DoubleStringCharactersopt "
    // ' SingleStringCharactersopt '

    // DoubleStringCharacters ::
    // DoubleStringCharacter DoubleStringCharactersopt

    // SingleStringCharacters ::
    // SingleStringCharacter SingleStringCharactersopt

    // DoubleStringCharacter ::
    // SourceCharacter but not double-quote " or backslash \ or LineTerminator > // \也是允许的 如果不是紧跟关键字的话，就单独是 @TODO: 输入是以String的形式 在读入时就应经被转义了何解? 
    // \ EscapeSequence
    // LineContinuation

    // SingleStringCharacter ::
    // SourceCharacter but not single-quote ' orbackslash \ or LineTerminator
    // \ EscapeSequence
    // LineContinuation

    // LineContinuation ::
    // \ LineTerminatorSequence

    // EscapeSequence ::
    // CharacterEscapeSequence
    // 0 [lookahead ∉ DecimalDigit]           注意这里的意思是  \0是接受的
    // HexEscapeSequence
    // UnicodeEscapeSequence

    // CharacterEscapeSequence ::
    // SingleEscapeCharacter
    // NonEscapeCharacter

    // SingleEscapeCharacter :: one of
    // ' " \ b f n r t v

    // NonEscapeCharacter ::
    // SourceCharacter but not EscapeCharacter or LineTerminator

    // EscapeCharacter ::
    // SingleEscapeCharacter
    // DecimalDigit
    // x 
    // u

    // HexEscapeSequence ::
    // x HexDigit HexDigit

    // UnicodeEscapeSequence ::
    // u HexDigit HexDigit HexDigit HexDigit


    /**
     * Lexer 相关
     * =============================
     */
    var InputElement = {
        EOF : -1,
        StringLiteral: 0,
        Identifier: 2,
        ReservedWord: 3,
        Punctuator:4,
        RegularExpressionLiteral:5


    }
    /**
     * 动态判断是否是RegExpContext
     */
    var isRegExpContext = function(){

    }
    var createToken = function(type, descriptor){
        (descriptor = descriptor || {}).type = type;
        return descriptor;
    }

    // 定义Elements, 包含tokens, line terminators, 注意的是空白与单行注释不参与语法组成
    // 但是多行注释如果有1+个lineTimeral 出现 则视为一个line terminator 加入语法解析

    var Elements = {
        // 1.EOF
        EOF: 0,
        // 2.LineTerminator
        LineTerminator: 2,
        // 3.Tokens
        // 3.1 
        Punctuator: 3,
        // 3.2 
        StringLiteral: 4,
        // 3.3
        NumericLiteral: 5,
        // 3.4 IdentifierName
        // 3.4.1
        Identifier:6,

        // 3.4.2 ReverseWord
        // 3.4.2.1 KeyWord
        KeyWord: 7,
        // 3.4.2.2 FutureReversedWord
        FutureReversedWord:8,
        // 3.4.2.3 Null
        NullLiteral:9,
        // 3.4.2.4 Bool
        BooleanLiteral:10,

        // define tokens but not in Token production
        // 4.1 DivPunctuator
        DivPunctuator: 16,
        // 4.2 RegularExpressionLiteral
        RegularExpressionLiteral: 17
    }
    /**
     * 获取下一个InputElement
     * @param  {[type]} input [description]
     * @return {[type]}
     */
    var lexer = function(input){
        var curPos = 0,
            curCode = 0,
            curToken,
            inputLength = input.length;
        // cacheList; 后期进行优化的缓存队列
        function nextToken(){
            consume();
            if(curPos >= inputLength){
                return Elements.EOF;
            }else{
                skip(); //跳过comment 以及 whitespcae
                curCode = charCode();
                if(isIdentifierStart(curCode)){
                    identifierName()
                }
                switch(curCode){
                   case:  
                }
            }
        }

        function charCode(offset){
            return input.charCodeAt(curPos + offset);
        }

        function consume(){
            curPos += 1;
        }


        function whitespace(){
            while(isWhiteSpace(curCode)){

            }
        }

        function comment(){

        }

        function number(){

        }


        var expect = function(){

        }

        var skip = function(){

        }

        var matchComment = function(){

        }

        var matchWhiteSpace = function(){

        }

        var unexpect = function(){

        }

        var eat = function(){

        }

        return function(){
            var element;
            while(element = nextToken()){
               console.log(element) 
            }
        }
    }

    var curLoc = {start: {column: 0, line: 1 }, end: {column: 0, line: 1 }};
    // reqwest({
    //     url: '/scan.js'
    //   , type: 'text'
    //   , method: 'get'
    //   , error: function (err) { 
    //     console.log(err)}
    //   , success: function (resp) {
    //     console.log(resp.responseText)
    //     }
    // })

    /**
     * Parser
     */
})

