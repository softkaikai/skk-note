### Events  

Node.js 所有的异步 I/O 操作在完成时都会发送一个事件到事件队列。
Node.js 里面的许多对象都会分发事件：一个 net.Server 对象会在每次有新连接时触发一个事件， 一个 fs.readStream 对象会在文件被打开的时候触发一个事件。 所有这些产生事件的对象都是 EventEmitter 的实例。
events模块供了一个对象： EventEmitter。EventEmitter 的核心就是事件触发与事件监听器功能的封装。
以下是EventEmitter常用的一些的功能，更加详细的信息请参考 [官网](http://nodejs.cn/api/events.html#events)

#### on
EventEmitter的实例提供了两个方法：  
eventEmitter.on(eventName, listener)方法，用于监听事件
eventEmitter.emit(eventName, args)方法，用于触发监听事件
其中on方法是addListener的别名
``` node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
// addListener跟上边的on方法是等效的
// myEmitter.addListener('event', () => {
//  console.log('an event occurred!');
// });
myEmitter.emit('event');

// emit方法还可以传递任意的参数
myEmitter.on('eventArgs', (...args) => {
  console.log(args);
  // 打印结果：['a', 'b']
});
myEmitter.emit('eventArgs', 'a', 'b');
```

#### off
off(eventName, listener)撤销事件的监听器
off是removeListener的别名
```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
function foo() {
    console.log('this is foo');
}
function bar() {
    console.log('this is bar');
}
myEmitter.on('event', foo)
myEmitter.on('event', bar)
myEmitter.emit('event')

myEmitter.off('event', foo)
// 等效myEmitter.removeListener('event', foo)
myEmitter.emit('event')
// 打印结果：
// this is foo
// this is bar
// this is bar
```

#### removeAllListeners
removeAllListeners(eventName?)接受一个可传事件参数
如果不传eventName，会撤销该实例上所有注册的事件监听器
```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
function foo() {
    console.log('this is foo');
}
function bar() {
    console.log('this is bar');
}
myEmitter.on('foo', foo)
myEmitter.on('bar', bar)
myEmitter.emit('foo')
myEmitter.emit('bar')

myEmitter.removeAllListeners()
myEmitter.emit('foo')
myEmitter.emit('bar')
// 打印结果：
// this is foo
// this is bar
```

如果传了eventName，只会撤销该事件的所有监听器
```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
function foo() {
    console.log('this is foo');
}
function bar() {
    console.log('this is bar');
}
myEmitter.on('foo', foo)
myEmitter.on('bar', bar)
myEmitter.emit('foo')
myEmitter.emit('bar')

myEmitter.removeAllListeners('bar')
myEmitter.emit('foo')
myEmitter.emit('bar')
// 打印结果：
// this is foo
// this is bar
// this is foo
```

#### once
once方法用于注册监听事件，当这个事件被触发的之后，该监听器就会被撤销

```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.once('event', () => {
  console.log('an event occurred!');
});
myEmitter.emit('event');
myEmitter.emit('event');
```

#### prependListener
prependListener的作用跟on都是一样的，用于添加事件监听器
on添加的监听器执行顺序是按照注册顺序来执行的
但是prependListener方法可以将listener放在监听器数组的首位
```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
function foo() {
    console.log('this is foo');
}
function bar() {
    console.log('this is bar');
}
myEmitter.on('event', () => {
    console.log('a');
})
myEmitter.on('event', () => {
    console.log('b');
})
myEmitter.prependListener('event', () => {
    console.log('prependListener');
})

myEmitter.emit('event')

// 打印结果
// prependListener
// a
// b
```

#### maxListeners
对于同一个事件，最多只能默认注册10个监听器
getMaxListeners方法可以知道最多可以注册多少个监听器
```node
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
console.log(myEmitter.getMaxListeners());
// 打印结果：10

for(let i = 0; i < 11; i++) {
    myEmitter.on('event', () => {})
}
// 这里为event事件注册了11个监听器，所以会导致如下报错信息
// MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 event listeners added to [MyEmitter]. 
// Use emitter.setMaxListeners() to increase limit
// 提示我们调用setMaxListeners方法可以修改最大监听器的数量
```