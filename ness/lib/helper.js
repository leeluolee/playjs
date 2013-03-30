
    var slice = Array.prototype.slice,
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
        };


    exports.Parser = function Parser(opts) {
        this._links = {}; //symbol link map
        this._rules = {}; //symbol def
        this.TRUNK = null;
    }

    Parser.prototype = {
      // ### 解析输入字符串input、返回action定义的data数据
      parse: function(input) {
        var
          remain = this.input = input,
          TRUNK = this.TRUNK;
        while (remain != (remain = remain.replace(TRUNK, this._process.bind(this)))) {}
      },
      // ###添加新规则 : 
      // 在nes中你可以想象成添加一个与Id、className、pesudo等价简单选择符
      on: function(rules) {
        for (var i in rules) {
          var reg = rule.regexp;
          rule.regexp = reg.toString().slice(1, -1);
          // 初始化order
          if (rule.order === undefined) rule.order = 1
          this._rules[i] = rule
        }
        // 每进行一次新规则监听，都重新组装一次
        this.setup()
        return this
      },
      _process: function() {
        var links = this._links,
          rules = this._rules,
          args = slice.call(arguments);

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
            retain = extractRefNum(rule.regexp) + 1; // 1就是那个all
          links[i] = [curIndex, retain] //分别是rule名，参数数量
          curIndex += retain;
          splits.push(regexp)
        }
        this.TRUNK = new RegExp("^(?:(" + splits.join(")|(") + "))")
        return this
      }
    }