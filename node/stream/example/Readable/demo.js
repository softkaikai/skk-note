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



