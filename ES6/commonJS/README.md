### 1.CommonJS 和 ES Module之间的区别
CommonJS 和 ES Module之间的差异主要有3点：
* CommonJS输出的是值的拷贝，ES Module输出的是值的引用。
* CommonJS是运行时加载，ES Module是编译时输出接口。
* CommonJS模块中的this指向当前模块，ES Module中的this是undefined。

#### 1.1 输出值的区别
__CommonJS输出的是值的拷贝__，并且是浅拷贝。一旦输出一个值，模块内部的值就不再影响到这个值了。如果是模块内部修改的是对象里面的一个值，还是会影响到输出的值。
我们看一个例子，首先创建个b.js
```js
// b.js
let num = 1
let person = {
    age: 11
}
function change() {
    num++
    person.age++
}
module.exports = {
    num,
    person,
    change
}
```
然后在a.js文件中导入b.js
```js
// a.js
const b = require('./b')

console.log(b.num); // 1
console.log(b.person); // {age: 11}
b.change()
console.log(b.num); // 1
console.log(b.person);// {age: 12}
```
从输出结果我们可以看出，输出的num值始终没有变，但是输出的person值中的属性age却发生了改变。

__ES Module输出的是值的引用__，我感觉把它比喻成“链接”更合适，有点像文件之间的“硬链接”的方式。
我们还是用实际例子来说话。首先在package.json文件中添加如下的字段，不知道原因的请[点击这里](#nodeLoadModule)
```json
{
    "type": "module"
}
```
创建b.js文件
```js
// b.js
export let num = 1
export let person = { age: 11 }
export function change() {
    num++
    person = { name: 'kaikai' }
}
```
在a.js中导入b.js
```js
// a.js
import {num, person, change} from './b.js'
console.log(num); // 1
console.log(person); // { age: 11 }
change()
console.log(num); // 2
console.log(person); // { name: 'kaikai' }

import('./b.js').then(({num, person}) => {
    console.log(num); // 2
    console.log(person); // { name: 'kaikai' }
})
```
尽管num是基本类型，当模块内部的num值改变后，输出的num值也跟着做了相应改变。
当我们再一次通过import('./b.js')异步导入b.js模块时，发现输出的任然时修改过后的值。

#### 1.2 加载时机不同
__CommonJS是运行时加载__，同时require也是同步加载，这也就意味着require可以在代码的任何地方使用。比如require可以在if中使用，也可以在函数中使用，设置导入的模块路径甚至可以是一个变量。
```js
// Commonjs模块
const a = require('a.js') // ok
const modulePath = './b.js'
const b = require(modulePath) // ok

// ok
if (true) {
    const a = require('a.js')
}
// ok
function bar() {
    const a = require('a.js')
}

```
但是对于导入ES6模块来说，这些方式都不可以。因为ES6模块是在编译阶段就将接口输出了，而if语句，函数语句以及变量这些东西都是在运行时才确定的东西，所以import语句只能在代码顶层使用。
```js
// ES6模块
import a from 'a.js' // ok
const modulePath = './b.js'
import b from modulePath // error

// error
if (true) {
    import a from 'a.js'
}
// error
function bar() {
    import a from 'a.js'
}

```
但是，正因为ES6模块是编译时输出，这也给它带来了另一个很大的优势，那就是tree shaking（摇树）

#### 1.3 tree shaking
所谓的tree shaking（摇树），就是在打包的时候，将模块中没有用到的多余代码删除掉，以此来减少包的体积。
比如在b.js中导出了两个变量num1, num2
```js
// b.js
export const num1 = 1
export const num2 = 2
```
我们在a.js文件中只导入num1
```js
// a.js
import {num1} from './b.js'
```
然后用webpack或者rollup对a.js打包的时候，就只包含num1这部分的代码，num2因为没有被用到，就被删除了。
正因为ES6模块是编译时就可以确定哪些导出的模块中哪些变量被使用了，哪些没有被使用，才使得tree shaking得以实现。
相反，CommonJS模块是运行时加载，你根本不知道在代码运行的时候会使用模块里面的哪些变量，再加上CommonJS模块导出的是整个对象，这就使得tree shaking更加难以实现。

#### 1.4 import()异步加载
前面我们说到了import不能在if中使用，也不能在函数中使用。那么有没有什么办法可以解决这个问题呢？
当然是有的，那就是 __import()异步加载__。通过这种方式，你就可以在任何地方异步加载ES6模块了。
只不过它是返回的是一个 __Promise__, 并且属于异步加载，而CommonJS的require是同步加载。
看下面的例子，创建b.js
```js
// b.js
export let num = 1
export let person = { age: 11 }
```
从a.js中导入b.js
```js
// a.js
function bar() {
    const modulePath = './b.js'
    import(modulePath).then(({num, person}) => {
        console.log(num); // 1
        console.log(person); // { age: 11 }
    })
}
bar()
```
还有一个问题，如果使用了import异步加载的话，就没法享受tree shaking带来的优化了。

### <a name="nodeLoadModule" id="nodeLoadModule">2.Node.js的模块加载方法</a>
最开始的时候Node.js只支持CommonJS模块的加载方式。但是在v13.2版本后，Node.js已经默认支持ES Module的加载了。
那么Node.js要怎么区别，我加载的是CommonJS的模块还是ES6的模块呢？于是Node.js就做了一个规定，凡是以.cjs为扩展名的统一认为是CommonJS模块，以.mjs结尾的是ES6模块。当然了，如果以.js结尾的默认为CommonJS模块。
还有另外一种方式是在 __package.json__ 文件中添加一个 __type__ 字段。如果不填type这个字段的话，默认type的值为commonjs。如果type === commonjs的话，Node.js会把所有js文件当作CommonJS模块。type还可以取另一个值module，这个值表示把所有js文件当作ES6模块。当然，以.cjs和.mjs结尾的文件不受type字段的影响。.mjs任然表示ES6模块，.cjs任然表示CommonJS模块
```json
{
    "type": "commonjs" // 或者module
}
```
还有一点需要注意的是，当type为module的时候，导入ES6模块不能省略扩展名，否则会报错
```js
import b from './b' // 错误
import b from './b.js' // 正确
```

### 3. CommonJS模块和ES Module模块相互导入
在CommonJS模块中是不能使用require来导入ES6模块的，只能使用import()异步加载的方式
```js
// b.mjs
export let num = 1
export let person = { age: 11 }
```
```js
// a.js
const a = require('./b.mjs')
// 提示如下错误
// internal/modules/cjs/loader.js:926
//     throw new ERR_REQUIRE_ESM(filename);
//     ^

// Error [ERR_REQUIRE_ESM]: Must use import to load ES Module: F:\source-code\node-test\b.mjs
//     at Module.load (internal/modules/cjs/loader.js:926:11)
//     at Function.Module._load (internal/modules/cjs/loader.js:769:14)
//     at Module.require (internal/modules/cjs/loader.js:952:19)
//     at require (internal/modules/cjs/helpers.js:88:18)
```
```js
// a.js
import('./b.mjs').then(data => {
    console.log(data); // 成功拿到数据
})
```

在ES6模块中可以之间导入CommonJS的模块
```js
// a.cjs
module.exports = {
    name: 'kaikai',
    age: 123
}
```
```js
// b.mjs
import * as a from './a.cjs'
console.log(a); // { default: { name: 'kaikai', age: 123 } }
```

```js
// b.mjs
import a from './a.cjs'
console.log(a); // { name: 'kaikai', age: 123 }
```

```js
// b.mjs
import {name} from './a.cjs'
// 会提示报错
// import {name} from './a.cjs'
//         ^^^^
// SyntaxError: Named export 'name' not found. The requested module './a.cjs' is a CommonJS module, which may not support all module.exports as named exports.
// CommonJS modules can always be imported via the default export, for example using:
```
在ES6模块中导入CommonJS模块不能只某个变量，如果要导入某个变量，只能这么干了
```js
// b.mjs
import a from './a.cjs'
const {name} = a
```

### 4. 循环加载