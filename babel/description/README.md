### Babel
Babel是个什么东西呢？官方给出的解释是：
Babel 是一个JavaScript编译器，主要用于将采用 ECMAScript 2015+ 语法编写的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。但是在我看来，Babel更像一个转换器，输入一段代码，对它进行转换，然后输出一段新的代码。

#### 1.Babel原理

![babelPrinciple](./imgs/babel-principle.webp 'babelPrinciple')  

Babel整体编译过程是如上图所示：
首先给一段代码给Babel，Babel会对这段代码进行parse解析，并生成AST（抽象语法树）。
之后对生成的AST进行编辑操作，这里就对应上图中的transform阶段。
最后用编辑过后的AST来生成最终的代码，这里对应途中的generate阶段。

#### 2.@babel/core
@babel/core是Babel里面的核心库，它的作用就是完成上面提到的一整套流程，包括代码解析，转换以及最后的代码生成。
我们看一个例子。假设有这么一个文件a.js，长下面这样
```js
// a.js
[1, 2, 3].map(n => 2 * n)
```
现在我们用@babel/core对它进行转换，我们创建一个transformer.js文件
```js
const babel = require('@babel/core')
const fs = require('fs')

const code = fs.readFileSync('./a.js', 'utf8')
// code = [1, 2, 3].map(n => 2 * n)

babel.transform(code, (err, result) => {
    console.log(result);
})
```
通过node运行上面文件，得出result结果是这样的
```json
{
  metadata: {},
  options: {
    assumptions: {},
    targets: {},
    cloneInputAst: true,
    babelrc: false,
    configFile: false,
    browserslistConfigFile: false,
    passPerPreset: false,
    envName: 'development',
    cwd: 'F:\\source-code\\babel-test',
    root: 'F:\\source-code\\babel-test',
    rootMode: 'root',
    plugins: [],
    presets: [],
    parserOpts: { sourceType: 'module', sourceFileName: undefined, plugins: [] },
    generatorOpts: {
      filename: undefined,
      auxiliaryCommentBefore: undefined,
      auxiliaryCommentAfter: undefined,
      retainLines: undefined,
      comments: true,
      shouldPrintComment: undefined,
      compact: 'auto',
      minified: undefined,
      sourceMaps: false,
      sourceRoot: undefined,
      sourceFileName: 'unknown'
    }
  },
  ast: null,
  code: '[1, 2, 3].map(n => 2 * n);',
  map: null,
  sourceType: 'module',
  externalDependencies: Set(0) {}
}
```
其中的code就是我们转换后的代码。但是，为什么转换前的代码和转换后的是一样的呢？
主要还是@babel/core里面并没有代码转换的具体实现，而是把这部分功能较给了插件实现，所以插件才是Bebel中真正的大头。
既然a.js文件中不是用了箭头函数吗，那我们就安装一个转换箭头函数的插件，名字叫 __@babel/plugin-transform-arrow-functions__,
并将它添加到配置文件的plugins中
```json
{
    "plugins": [
        "@babel/plugin-transform-arrow-functions"
    ]
}
```
然后我们再运行transformer.js就会看到最后生成的代码是这样的
```js
[1, 2, 3].map(function (n) {\n  return 2 * n;\n});
```

#### 3.@babel/parser, @babel/traverse和@babel/generator
为什么把这3个东西放一起讲呢，主要还是@bable/core的一整套流程就是靠这几个小家伙实现的。
上面我们已经提到了，@babel/core主要有3个阶段
* parse阶段
* transform阶段
* generate阶段

其中parse阶段就是用@babel/parser对code进行解析，然后输出一段AST；
在transform阶段，通过@babel/traverse对AST里面的节点进行遍历，然后就可以对这些节点进行增，删，改的操作了；
最后的generate阶段，就是用@babel/generator用修改后的AST来生成最终的代码。

#### 4.预设@babel/preset-*
所谓的预设就是一堆插件的集合。比如说我们需要对箭头函数进行转换，需要添加插件@babel/plugin-transform-arrow-functions，
如果我们还需要对class进行转换，还要添加插件@babel/plugin-transform-classes。再进一步，对for of进行转换，我们还需要添加插件@babel/plugin-transform-for-of。
像这样每次都要一个个的安装插件就太麻烦，所以我们聪明的开发人员就索性把常用的插件打个包，下次再用的时候，我就只安装这个包就可以了。
比如最常用的一个预设@babel/preset-env就包含了上面提到的所有插件，我们只需要安装这一个就可以使用大部分javascript的新功能了。现在我们对 babel.config.json 文件进行修改，把@babel/preset-env加进入，并把@babel/plugin-transform-arrow-functions这个插件删除掉
```json
{
    "presets": ["@babel/preset-env"]
}
```
我们再运行transformer.js文件，对a.js文件进行转换，得出如下结果:
```js
"use strict";\n\n[1, 2, 3].map(function (n) {\n  return 2 * n;\n});
```
你看，尽管@babel/plugin-transform-arrow-functions这个插件被我们删除了，箭头函数还是被转换了。
但是，问题又来了，上面的 __map__ 函数没有被转换呢，如果我们要转换它，又需要做些什么呢？
这就牵扯出Babel的另一个重点了，polyfill（垫片）。

#### 5.@babel/polyfill
上面我们提到了 __map__ 函数没有得到转换，那我们是不是给它配置相应的插件就可以了呢？
答案是：不行。因为插件只对js的语法进行转换，而诸如 __map filter forEach Promise__ 之类的是输入API的范畴，所以插件表示我也爱莫能助。  

![wunai](./imgs/wunai.jpeg)  

那么要使用新API的话，就要用到 __@babel/polyfill__ 了。
因为在Babel 7.4.0版本之后，__@babel/polyfill__ 这个库就被废弃了，官方给出建议让我们用下面这两个库
* [core-js](https://github.com/zloirock/core-js) 主要实现了对 __Promise Set Map__ 等这些api的支持
* [regenerator-runtime](https://www.npmjs.com/package/regenerator-runtime) 主要实现了对生成器generator 和 async的支持。

要想使用polyfill还需要对@babel/preset-env的options中两个参数进行配置。
* __useBuiltIns__ 决定如何引用polyfill
* __corejs__ 使用core-js的哪个版本
  
首先看 __useBuiltIns__，它共有三个值 “entry” “usage” 和 false（默认值）
__useBuiltIns = false__ 的时候，会将整个core-js模块导入进来。
修改babel.config.json，如下：
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": false,
            }
        ]
    ]
}
```
在a.js中引入core-js
```js
import "core-js"

[1, 2, 3].map(n => 2 * n)

new Promise((resolve) => {
    resolve()
})
```
最后编译输出结果
```js
"use strict";

// 整个core-js模块都被导入进来了
require("core-js");

[1, 2, 3].map(function (n) {
  return 2 * n;
});
new Promise(function (resolve) {
  resolve();
});

```

__useBuiltIns = usage__ 的话，就只会导入你在文件中使用过的API。
另外如果useBuiltIns为usage或者entry的话，需要指定core-js的版本。
修改babel.config.json，如下
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 2
            }
        ]
    ]
}
```
同时a.js里不用导入core-js了，编译的时候会自动导入需要的那部分
```js
// import "core-js"

[1, 2, 3].map(n => 2 * n)

new Promise((resolve) => {
    resolve()
})

```
最后输出结果中可以看到，只导入了我们需要的那部分
```js
"use strict";

require("core-js/modules/es6.array.map.js");

require("core-js/modules/es6.object.to-string.js");

require("core-js/modules/es6.promise.js");

// import "core-js"
[1, 2, 3].map(function (n) {
  return 2 * n;
});
new Promise(function (resolve) {
  resolve();
});

```

__useBuiltIns = entry__ 的时候呢，Babel会根据你配置的浏览器目标来导入目标浏览器所不支持的模块。
我们创建一个 __.browserslistrc__ 文件，用来配置目标浏览器
```
Chrome > 60
```
修改babel.config.json文件
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "entry",
                "corejs": 2
            }
        ]
    ]
}
```
修改a.js文件
```js
import "core-js"

[1, 2, 3].map(n => 2 * n)

new Promise((resolve) => {
    resolve()
})

```
然后编译，得出结果
```js
"use strict";

require("core-js/modules/es7.array.flat-map.js");

require("core-js/modules/es6.array.iterator.js");

require("core-js/modules/es6.array.sort.js");

require("core-js/modules/es7.object.define-getter.js");

require("core-js/modules/es7.object.define-setter.js");

require("core-js/modules/es7.object.lookup-getter.js");

require("core-js/modules/es7.object.lookup-setter.js");

require("core-js/modules/es7.promise.finally.js");

require("core-js/modules/es7.symbol.async-iterator.js");

require("core-js/modules/es7.string.trim-left.js");

require("core-js/modules/es7.string.trim-right.js");

require("core-js/modules/web.timers.js");

require("core-js/modules/web.immediate.js");

require("core-js/modules/web.dom.iterable.js");

[1, 2, 3].map(n => 2 * n);
new Promise(resolve => {
  resolve();
});

```

从中我们可以看出，多了很多在文件中没有用过的模块。相反map模块却没有导入，主要还是因为Chrome60以后的版本都支持了map方法。

但是，我们又发现了一个，上面的core-js模块都是全局导入的，会对全局环境造成污染。如果是在自己的项目中这样做，问题不大。但是你要是在公共的库/工具里面这样做就可能会造成问题。比如，你在自己的库中使用了map方法，就需要导入core-js的map模块，就是这个 __require("core-js/modules/es6.array.map.js")__，然后你就高高兴兴的把代码提交了。第二天，有一个叫 __李文__ 的开发人员，他在自己项目中实现了Array.prototype.map这个方法，然后他又导入了你写的那个库，结果发现他自己写的那个map函数不能用了。随后他就提着刀，跑到你仓库的issue下面就开始 __******__。
所以为了解决这个问题，就有了 __@babel/plugin-transform-runtime 和 @babel/runtime__ 这两个”连体婴儿“。  
&nbsp;
&nbsp;

#### 6. @babel/plugin-transform-runtime 和 @babel/runtime
因为 __@babel/plugin-transform-runtime 和 @babel/runtime__ 这两个经常要一起使用，所以称他们为”连体婴儿“。
__@babel/runtime__ 是一个工具库，它主要给Babel提供一些帮助函数。因为这个帮助函数是需要在生产环境中使用的，所以下载它的时候要用--save
```node
npm install --save @babel/runtime
```
相反，@babel/plugin-transform-runtime只在开发中使用，所以用--save-dev 安装
```node
npm install --save-dev @babel/plugin-transform-runtime
```
比如，我们在不配置@babel/plugin-transform-runtime情况下编译如下的a.js文件
```js
class Circle {}
```
同时，babel.config.json配置如下
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 2
            }
        ]
    ]
}
```
得到的a.js编译结果是：
```js
"use strict";

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Circle = /*#__PURE__*/_createClass(function Circle() {
  _classCallCheck(this, Circle);
});
```
我们可以看到多了两个函数 ___createClass 和 _classCallCheck__，如果我们还有b.js，c.js文件都用了class语法，那么在b.js和c.js最后生成的文件中都会有这两个函数，这样就造成了很多重复。
如果我们配置了@babel/plugin-transform-runtime又会怎么样呢？
修改babel.config.json文件
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": 2
            }
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": false
            }
        ]
    ]
}
```
重新编译得到输出结果为：
```js
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var Circle = /*#__PURE__*/(0, _createClass2.default)(function Circle() {
  (0, _classCallCheck2.default)(this, Circle);
});
```
从中可以看到 ___createClass2 和 _classCallCheck2__ 这两个函数都是通过导入 __@babel/runtime__ 里面的模块得到的。这样就避免了在不同文件中都会生成同样的函数了，从而大大减小了最后包生成的体积。
在刚刚的babel.config.json文件中，我们给@babel/plugin-transform-runtime插件配置了一个叫corejs的参数。
这个参数的作用是，根据corejs配置不同的值，@babel/plugin-transform-runtime内部会调用不同库的@babel/runtime。
具体配置如下：  

|corejs|@babel/runtime库|
|:--|:--|
|false|@babel/runtime|
|2|@babel/runtime-corejs2|
|3|@babel/runtime-corejs3|  

那么 __@babel/runtime-corejs2__ 有什么用呢？
上面我们提到过，直接引入polyfill会导致全局变量污染，那么 __@babel/runtime-corejs2__ 就是解决这个问题。
修改a.js文件
```js
// a.js
[1, 2, 3].map(i => i * 2)

new Promise(() => {
    
})
```
修改babel.config.json
```json
{
    "presets": [
        [
            "@babel/preset-env",
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": 2
            }
        ]
    ]
}
```
编译输出结果为：
```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

[1, 2, 3].map(function (i) {
  return i * 2;
});
new _promise.default(function () {});

```
原来的 __Promise__ 被一个变量 ___promise__ 替换掉了，这样就解决了全局环境污染的问题。
但是还有个问题，为什么 __map__ 方法没有被替换掉。这是因为 __@babel/runtime-corejs2__ 这个库只会替换静态的方法，实例的方法不会替换。这个时候就需要 __@babel/runtime-corejs3__ 出马了，它就可以替换实例上的方法
修改babel.config.json
```json
{
    "presets": [
        [
            "@babel/preset-env",
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": 3
            }
        ]
    ]
}
```
编译输出结果为：
```js
"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _context;
// map方法被替换掉了。
(0, _map.default)(_context = [1, 2, 3]).call(_context, function (i) {
  return i * 2;
});
new _promise.default(function () {});

```

__总结：__
使用polyfill（垫片）有两种方式：
* 第一种，通过配置@babel/preset-env的参数 __useBuiltIns 和 corejs__ 来使用
* 第二种，通过配置"@babel/plugin-transform-runtime"的参数 __corejs__ 来使用

这两种方式区别在于，第一种会造成全局变量环境污染，而第二种就不会。还有就是第一种方式具有3种polyfill的导入方式：usage，entry 和 false。第二种方式呢，只能按需导入。

@babel/plugin-transform-runtime插件的作用：
* 第一种，引入帮助函数，减少重复代码
* 第二种，引入polyfill（垫片），并且能够避免造成全局变量环境污染

#### 7. @babel/cli
__@babel/cli__ 是Bable的一个命令行工具，安装了它，你就可以通过命令行来对js文件进行编译。
比如：先安装@babel/cli
```node
npm install --save-dev @babel/cli
```
然后我们就可以在命令行终端运行如下命令来编译文件了
```node
npx babel a.js --out-file dis.js
```