### SpecialTypes: any unknown void never null undefined
在看别人写的文章的时候，经常看到any是其他类型的子类型，可以赋值给其他类型，
null和undefined也可以赋值给其他类型，连never也可以赋值给其他类型。
既然这样的话
* null是否可以赋值给never呢，never又是否能赋值给null呢？
* any是否可以赋值给unknown呢，unknown又是否能赋值给any呢？
* 感觉any的作用和unknown差不多，它们两个又有什么关系呢？
* void和never的关系又是怎样的呢？
* never到底有什么用处呢？

#### 1.各种类型相互赋值的关系
我这里从官网扒拉下来的一张图片，这张图表明了在 __strictNullChecks__ 关闭的情况下，各种类型赋值情况
![类型赋值](https://qiniustg.servever.cn/E081FBD98A3365A72E01C2FA5C00 '类型赋值')
从上图可以看出
有且仅有never类型一个，才能够赋值给其它任何类型，它的范围最广，属于第一梯队
其次就是any、null 和 undefined属于第二梯队，它们可以赋值给出了never类型的其它任何类型
另外还得出一个结论，只有never类型才可以赋值给never类型，除此之外的其它任何类型都不能赋值给never类型
第三梯队就是object和void了，它们只能赋值给any和unknown
最次的就是unknown了，只能赋值给any
__strictNullChecks__ 设置为true的时候，null和undefined的将不能赋值给其他类型，除了any, unknown以及void这个类型以外

#### 2.any和unknown
首先，有一点是相同的，那就是所有类型都可以赋值给any和unknown类型
那么他们的不同之处在于，any可以赋值给除了never以外的其他任何类型，但是unknown却只能赋值给any类型
如果unknown要想赋值给其他类型，需要通过断言来赋值，或者类型收缩，比如
```typescript
let unknownData: unknown = 1
let stringData: string
stringData = unknownData // Error提示：不能将unknown类型赋值给stringData
stringData = unknownData as string // 成功
```
另外，对any类型进行任何操作都不会报错，但是对unknown进行任何操作都会报错，比如
```typescript
const unknownData: unknown = 1
const anyData: any = 1

interface Temp {
    a: string;
    length: number;
    fn: () => void
}

console.log(anyData.a); // success
console.log(anyData.fn()); // success
console.log(anyData.length); // success

console.log(unknownData.a); // error
console.log(unknownData.fn());  // error
console.log(unknownData.length);  // error

// 使用断言就可以通过语法检测
console.log((unknownData as Temp).a); // success
console.log((unknownData as Temp).fn());  // success
console.log((unknownData as Temp).length);  // success

// 使用类型收缩也可以通过语法检测
if(typeof unknownData === 'string') {
    unknownData.toLocaleLowerCase() // success
}
```
总结：typescript不会对any进行语法检测，对unknown会进行语法检测，所以unknown比any更严格一些，也更安全

#### 3.void和never
__void__ 与 __any__ 相反，表示无任何类型，通常用于表示函数没有返回值，或者返回值为undefined
```typescript
function fn1(): void {
    console.log(1);
}
function fn2(): void {
    console.log(2);
    return undefined
}
```
__never__ 表示永不存在的值的类型，那么什么叫永不存在的值的类型
比如说有些函数总是抛出错误，那么这个函数永远不会有返回值
```typescript
function fn1(): never {
    throw new Error('err')
}
```
还有就是进入死循环的函数，也永远不会有返回值
```typescript
function fn1(): never {
    while(true) {

    }
}
```
还有一种，看下面的示例
```typescript
enum Fruit {
    APPLE,
    ORANGE,
    BANANA,
    WATERMELON,
}
function foo(fruit: Fruit) {
    switch(fruit) {
        case Fruit.APPLE:
            console.log('APPLE');
            break;
        case Fruit.ORANGE:
            console.log('ORANGE');
            break;
        case Fruit.BANANA:
            console.log('BANANA');
            break;
        default:
            // 因为上面case已经穷尽了所有枚举类型
            // 所以代码永远不会执行到这里，使得下面的赋值可以通过
            const temp:never = fruit
            break;
    }
}
```
如果我们往Fruit里面加了一种类型WATERMELON,结果又会如何呢
```typescript
enum Fruit {
    APPLE,
    ORANGE,
    BANANA,
    WATERMELON,
}
function foo(fruit: Fruit) {
    switch(fruit) {
        case Fruit.APPLE:
            console.log('APPLE');
            break;
        case Fruit.ORANGE:
            console.log('ORANGE');
            break;
        case Fruit.BANANA:
            console.log('BANANA');
            break;
        default:
            const temp:never = fruit // error提示：fruit不能赋值给never类型
            break;
    }
}
```
因为case没有穷尽所有的枚举类型，把WATERMELON这种类型给漏了，所以代码可能会进入到default里面，
那么temp就是可能存在值得类型了，所以会报错
之所以在default里面添加 __const temp:never = fruit__ 这么一条语句
就是为了防止某一天，某个人往Fruit枚举里面加了一种类型，但是他却忘记在switch里面添加相应得类型处理
这个时候 __const temp:never = fruit__ 这条语句就会报错，提醒你要往switch里面添加相应得类型处理

参考资料：[https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability)