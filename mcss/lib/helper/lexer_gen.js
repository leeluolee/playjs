exports.gen = function(){
    return new LGen(rules)
}



  // Parser 相关
  var
  //抽离出字匹配数目
    ignoredRef = /\(\?\!|\(\?\:/,
    extractRefNum = function(regStr) {
      var left = 0,
        right = 0,
        len = regStr.length,
        ignored = regStr.split(ignoredRef).length - 1; //忽略非捕获匹配
      for (; len--;) {
        var letter = regStr.charAt(len);
        if (len === 0 || regStr.charAt(len - 1) !== "\\"){//不包括转义括号
          if (letter === "(") left++;
          if (letter === ")") right++;
        }
      }
      if (left !== right) throw regStr + "中的括号不匹配";
      else return left - ignored;
    },
    //前向引用 如\1 \12 等在TRUNK合并时要做处理
    refIndexReg = /\\(\d+)/g,
    extractRefIndex = function(regStr, curIndex) {
      return regStr.replace(refIndexReg, function(a, b) {
        return "\\" + (parseInt(b,10) + curIndex);
      });
    },
    // // 生成默认的action，这个会将匹配到的参数推入一个同名的数组内
    // createAction = function(name) {
    //   return function(all) {
    //     var parsed = this.parsed,
    //       current = parsed[name] || (parsed[name] = [])
    //       current.push(slice.call(arguments))
    //   }
    // },
    // Object.keys 规则排序时的调用方法
    keys = Object.keys || function(obj) {
      var result = [];
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) result.push(prop);
      }
      return result;
    },
    // 将规则中的reg中的macro替换掉
    cleanRule = function(rule) {
      var reg = rule.reg;
      //如果已经是regexp了就转为string
      if (typeOf(reg) === "regexp") reg = reg.toString().slice(1, -1);
      //将macro替换
      rule.regexp = reg.replace(replaceReg, function(a, b) {
        if (b in macros) return macros[b];
        else throw new Error('can"t replace undefined macros:' + b);
      });
      return rule;
    },
    cleanRules = function(rules) {
      for (var i in rules) {
        if (rules.hasOwnProperty(i)) cleanRule(rules[i])
      }
      return rules
    }


  // ##2. Parser
  // 



  function Parser(opts) {
      opts = opts || {};
      if (opts.macros) this._macros = opts.macros;
      this._links = {}; //symbol link map
      this._rules = {}; //symbol def
      this.TRUNK = null;
    }

  extend(Parser.prototype, {
    parse: function(input) {
      // 清理input数据、因为parsed数据最终会被缓存，
      // 我们要尽量让相同的选择器只对应一份parsed数据
      input = clean(input)
      // 先检查缓存中是否有数据
      if (parsed = this.cache.get(input)) return parsed
      // 如果没有: 初始化参数
      var parsed = this.parsed = [
        [null]
      ],
        remain = this.input = input,
        TRUNK = this.TRUNK
        // 将remain进行this._process这里每匹配一个字符串都会进行一次reduce
      while (remain != (remain = remain.replace(TRUNK, this._process.bind(this)))) {}
      // 如果没有被解析完 证明选择器字符串有不能被解析的部分
      if (remain !== '') this.error(remain)
      // 返回数据并推入cache
      return this.cache.set(input, parsed)
    },
    // ###添加新规则 : 
    // 在nes中你可以想象成添加一个与Id、className、pesudo等价简单选择符
    on: function(rules) {
      if (typeOf(rules) === "string") { //当不是hash传入时
        var tmp = {}
        tmp[rules] = arguments[1]
        rules = tmp
      }
      // 可以同时接受object型或者key, value对的参数
      for (var i in rules) {
        var rule = rules[i]
        if (typeOf(rule) !== "object") {
          rule = {
            regexp: rule
          }
        }
        var reg = rule.regexp
        if (typeOf(reg) === "regexp") {
          rule.regexp = reg.toString().slice(1, -1)
        }
        // 初始化order
        if (rule.order === undefined) rule.order = 1
        this._rules[i] = rule
      }
      // 每进行一次新规则监听，都重新组装一次
      this.setup()
      return this
    },
    // ###__删除规则__ :
    // 删除对应规则, 即nes的规则都是在运行时可删可增的
    off: function(name) {
      if (typeOf(name) === "array") {
        for (var i = name.length; i--;) {
          this.off(name[i])
        }
      } else {
        if (this._rules[name]) {
          delete this._rules[name]
        }
      }
      return this
    },
    // 获得当前解析位置所在的datum，你只需要在这个datum中塞数据即可
    current: function() {
      var data = this.parsed
      var piece = data[data.length - 1],
        len = piece.length
      return piece[len - 1] || (piece[len - 1] = {
        tag: "*"
      })
    },
    error: function(info) {
      throw Error("输入  " + this.input + "  含有未识别语句:" + info || "")
    },

    clone: function(parser) {
      return new Parser().on(this._rules)
    },
    // __`this.parser`__的依赖方法，
    // 即遍历links检查是否有子匹配满足关系，
    // 有则推入对应的action数组,
    // 注意由于其是是replace方法的调用，每次都要返回""完成
    // reduce操作
    _process: function() {
      var links = this._links,
        rules = this._rules,
        args = slice.call(arguments)

        for (var i in links) {
          var link = links[i],
            retain = link[1],
            index = parseInt(link[0])
          if (args[index] && (rule = rules[i])) {
            rule.action.apply(this, args.slice(index, index + retain))
            return ""
          }
        }
      return ""
    },
    // 组装
    setup: function() {
      cleanRules(this._rules)
      var curIndex = 1,
        //当前下标
        splits = [],
        rules = this._rules,
        links = this._links,
        ruleNames = keys(rules).sort(function(a, b) {
          return rules[a].order >= rules[b].order
        }),
        len = ruleNames.length;

      for (; len--;) {
        var i = ruleNames[len],
          rule = rules[i],
          retain = extractRefNum(rule.regexp) + 1 // 1就是那个all
        if(rule.filter && !filters[i]){ 
          filters[i] = rule.filter
          } //将filter转移到filters下
        links[i] = [curIndex, retain] //分别是rule名，参数数量
        var regexp = extractRefIndex(rule.regexp, curIndex - 1);
        curIndex += retain;
        splits.push(regexp)
      }
      this.TRUNK = new RegExp("^(?:(" + splits.join(")|(") + "))")
      return this
    }
  })

