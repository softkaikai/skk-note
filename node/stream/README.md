### Stream
stream在node中主要是用来处理数据的抽象接口。
node中常用的流，例如：http请求，fs.createReadStream，process.stdout, process.stdin等等  
更加详细的信息请参考[官网](http://nodejs.cn/api/stream.html)

stream总共有四种类型
* [Readable](#Readable) - 可读流
* [Writable](#Writable) - 可写流
* [Duplex](#Duplex) - 双工流 可读可写流
* [Transform](#Transform) - 转换流 可读可写流

stream继承自[EventEmitter](../events/README.md)，所以stream可以监听某些特定的事件。
Readable可读流中常用的事件有：
* data - 当有数据可读时触发
* end - 没有更多数据可读时触发
* error - 在接受数据时发生错误触发
* close - 当流及其任何底层资源（例如文件描述符）已关闭时触发


Writable可写流中常用的事件有：
* drain - 可以继续往流中写入数据时触发
* finish - 在调用 stream.end() 方法之后，并且所有数据都已刷新到底层系统时触发
* close - 当流及其任何底层资源（例如文件描述符）已关闭时触发



#### <a id="Readable" name="Readable">Readable</a>
官方给的解释是：可读流是对被消费的数据的来源的抽象。
这里有一个对可读流形象的比喻
可读流就好比一个装有水的桶，桶下面有一个水龙头，默认情况下这个水龙头是关着的，
当你想要拿桶里的水的时候，把水龙头一打开，水就自动流出来了。

Readable流有两种模式：流动模式和暂停模式，官方给出的这两种模式解释如下
* 在流动模式下，数据会自动从底层系统读取，并通过 EventEmitter 接口使用事件尽快提供给应用程序
* 在暂停模式下，必须显式调用 stream.read() 方法以从流中读取数据块

官方的解释还是比较抽象，如果我们把Readable流比作上面的水桶的话
* 暂停模式就相当于水桶的水龙头关闭的状态，桶里面的水流不出去
* 流动模式就相当于水龙头打开的状态，桶里面的水源源不断的流出去，供你使用

默认情况下，Readable流都是出于暂停模式，也就是水龙头关着的状态
Readable流提供了3中方法用于打开水龙头的方法，也就是将暂停模式切换成流动模式
* 为Readable流添加data事件监听器。
* 调用 stream.resume() 方法。
* 调用 stream.pipe() 方法将数据发送到 Writable。

##### data事件
我们看看如何通过添加data事件监听器的方式，从可读流中拿到数据

首先创建一个名为foo.txt的文件，文件内容如下
```txt
this is a txt file
```
然后我们通过fs创建一个可读流来读这个文件里面的内容
```node
const fs = require('fs')

// fs.createReadStream创建一个可读流，这个可读流可以读取./foo.txt文件里面的内容
const readStream = fs.createReadStream('./foo.txt', 'utf8')

// Readable流继承了EventEmitter,所以可以为其添加事件监听器
// 当readStream流里面有数据的时候，就会触发data事件，数据通过回调函数返回
// 添加data事件后，流自动切换为流动模式
readStream.on('data', (data) => {
    console.log(data);
    // 打印结果：this is a txt file
    // 正好是foo.txt里面的内容
})
// 没有更多数据可读时，触发end事件
readStream.on('end', () => {
    console.log('read end');
})
```

##### readable事件 和 read()
除了上面通过监听'data'事件获取数据外，还可通过'readable' 事件 与 stream.read()相结合来获取数据
当有可从流中读取的数据或已到达流的末尾时，则将触发 'readable' 事件
可以通过stream.read([size])方法读取数据，size表示从缓冲区读取字节数，如果不传size，表示读取整个缓冲区的数据
如果stream.read()返回结果为null，表示没有更多数据可供读取，否则表示还有数据可读
当添加了'readable' 事件句柄后，流进入暂停模式，即使添加了'data'事件句柄，流任然是处于暂停模式
但是在调用stream.read方法后，会触发data事件
```node
const fs = require('fs')

const readStream = fs.createReadStream('./foo.txt', 'utf8')

let result = ''
readStream.on('readable', () => {
    let data
    while((data = readStream.read()) !== null) {
        result += data;
    }
    
})

readStream.on('end', () => {
    console.log(result);
    // 打印结果：this is a txt file
})
```

#### 自定义可读流
官方提供了自定义可读流的构造函数Readable
自定义可读流需要自己实现 [readable_read](http://nodejs.cn/api/stream.html#readable_readsize) 方法，
同时我们需要调用 [readable.push](http://nodejs.cn/api/stream.html#readablepushchunk-encoding) 方法，将数据推送到读取队列中，供下游消费。
readable.push如果返回true，表示还可以继续将数据推送到读取队列中，直到返回false
```node
const { Readable } = require('stream')

class MyReadable extends Readable {
    constructor(options) {
        super(options)
    }
    _read(size) {
        this.push('this is a readStream')
        this.push('this is a MyReadable')
        // 传递null表示流结束，之后不能再写入数据
        this.push(null)
    }
}

const readStream = new MyReadable()

readStream.setEncoding('utf8')
readStream.on('data', (data) => {
    console.log(data);
    // 打印结果：
    // this is a readStream
    // this is a MyReadable
})
```

### <a id="Writable" name="Writable">Writable</a>
可写流是数据写入目标的抽象
可以调用[writable.write](http://nodejs.cn/api/stream.html#writablewritechunk-encoding-callback)往流中写入数据，如果返回值是true，可以继续调用writable.write写入数据
如果返回值是false，需要等待drain事件触发后才能继续调用writable.write写入数据

#### 自定义可写流
```node
const { Writable } = require('stream')

class MyWritable extends Writable{
    constructor(options) {
        super(options)
    }

    _write(chunk, encoding, next) {
        next()
    }
}
const writeStream = new MyWritable()

writeStream.write('123')
writeStream.end('123')
writeStream.on('finish', () => {
    console.log('finish');
})
```

### <a id="Duplex" name="Duplex">Duplex</a>
Duplex 可读可写流，可读和可写区域是独立的，两者没有关系

#### 自定义Duplex流
需要同时实现_read 和 _write方法
```node
const { Duplex } = require('stream')

class MyDuplex extends Duplex{
    constructor(options) {
        super(options)
    }

    _read(size) {
        this.push('this is MyDuplex')
        this.push(null)
    }
    _write(chunk, encoding, next) {
        next()
    }
}
const writeStream = new MyDuplex()

writeStream.write('123')
writeStream.end('123')
writeStream.on('finish', () => {
    console.log('write finish');
})

writeStream.setEncoding('utf8')
writeStream.on('data', (data) => {
    console.log(data);
    // 打印结果：this is MyDuplex
})
writeStream.on('end', () => {
    console.log('read end');
})
```

### <a id="Transform" name="Transform">Transform</a>
Transform 可读可写流，可读和可写区域不是独立，
#### 自定义Transform流
自定义的 Transform 实现必须实现 transform._transform() 方法，也可以实现 transform._flush() 方法
```node
const { Transform } = require('stream')

class MyTransform extends Transform{
    constructor(options) {
        super(options)
    }

    _transform(chunk, encoding, next) {
        this.push(chunk.reverse() + '-')
        next()
    }
    _flush(next) {
        this.push('end')
        next()
    }
}
const myTransform = new MyTransform()

myTransform.write('123')
myTransform.end('abc')

myTransform.setEncoding('utf8')
myTransform.on('data', (data) => {
    console.log(data);
    // 打印结果：321-cba-end
})
```
