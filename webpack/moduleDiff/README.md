### 模块化规范
随着前端应用功能越来越多，越来越复杂，人们就不可避免的对前端模块化提出了要求，因此先后就诞生了
AMD, Commonjs 以及 ES module这几种模块化规范

#### 1.Commonjs
Commonjs是node所采用的模块化规范
根据CommonJS规范，一个单独的文件就是一个模块。每一个模块都是一个单独的作用域，也就是说，在该模块内部定义的变量，无法被其他模块读取，除非定义为global对象的属性。
模块只有一个出口module.exports，需要导出的数据需要放到该对象上
```node
const someData = {name: 'foo'}

module.exports = someData
```

#### 2.AMD
浏览器看到node有了自己的模块化规范，就对node说：

“哥们儿，你把你那个commonjs的模块化规范给我用一用呗，我也想整一个”。

node听后，赶忙拒绝，说：

“那不行，commonjs加载模块是同步的，你浏览器那个网络环境不适合用。万一你要是网络卡壳了，某一个模块半天下载不下来，那你程序不就挂住了。”

浏览器听后恼羞成怒，大骂到：

“球大爷稀罕你的commonjs啊，爹有娘有不如自己有，老子自己搞一个”

![fennv](imgs/fennv.gif "fennv")

随后，浏览器就从裤裆里掏出了一个叫AMD的东西，然后它就拿着AMD跑到node面前炫耀

“看，老子李云龙也有大炮了，这玩意儿跟commonjs可不一样，它是异步加载模块的，这样就很适合浏览器使用了”

“看我给你简单操作一哈”

首先定义模块
```js
// someModule.js
define(function() {
    var someModuleData = {
        name: 'module'
    }
    return someModuleData
})
```
接下来是调用模块
```js
define(['./someModule.js'], function(someModuleData) {
    console.log(someModuleData.name)
})
```

#### 3. ES Module
随着时间的推移，人们越发觉得，毕竟AMD是个野种，没有得到人家js官方的认可。
所以之后呢，人家js官方自己又整了一个叫 __ES Module__ 的模块化规范出来。
人家毕竟是正统啊，__ES Module__ 一经推出，就受到了大家的追捧。__AMD__ 也随之失去它的光彩，
逐渐消失在了历史舞台上。
此外，因为node本身使用的就是javascript，最终还是经受不住正统的血脉压制，随后也选择了兼容 __ES Module__。
正所谓一家欢喜一家忧，面试官又有问题可问了：[Commonjs和ES Module具体有什么区别呢？](./README.md)
哎！！！

![weiqu](./imgs/weiqu.gif 'weiqu')
ES Modlue常用导出方式
```js
export const a = 123
export default 'abc'
```

#### 4.UMD
之前我们讲到，node和浏览器分别使用了不同的模块化方案，一个是 __Commonjs__, 另一个是 __AMD__。
这时候做开发的小伙伴就忍不住了，跳起来就是一耳si，大骂到：

“TMD，我要是写了一个在node和浏览器都能使用的模块，我是不是最后要分别给它们生一个文件啊，想要让我花时间多生成一个文件，哼，想都别想，谁也不能偷走我滑水的时间”

![fennv1](./imgs/fennv1.gif 'fennv1')

一怒之下，开发的小伙伴就弄出来一个叫 __UMD__ 的东西，这个东西不仅能够兼容 __Commonjs__ 和 __AMD__，它还能够通过浏览器直接导入，把模块挂载到一个全局变量上
假设有这样一个 __UMD__ 模块叫 __highjs__ 的，通常 __UMD__ 模块长这样。
另外，__UMD__ 并不是一个模块化规范，它只是对 __Commonjs__ 和 __AMD__ 兼容
```js
(function(root, factory) {
    // 兼容commonjs
    if(typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory()
    // 兼容AMD
    } else if (typeof define === 'function' && define.amd) {
        defind(factory)
    } else {
        // 在浏览器环境上 root = window
        // 支持浏览器通过script标签直接导入，并把模块赋值到全局变量highjs上
        root.highjs = factory()
    }
})(this, function(moduleData) {
    // 导出的模块
    return moduleData
})
```