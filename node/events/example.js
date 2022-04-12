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

// prependListener
// a
// b