### extends
本文主要介绍总结extends在typescript中有哪些用法以及在高级类型中的应用

#### 1.继承
这个就不多介绍了，主要是接口以及类的继承
```typescript
interface Person {
    name: string
}

interface WhitePerson extends Person {
    age: number
}  

const foo: WhitePerson = {
    name: 'foo',
    age: 23
}
```

#### 2.类型约束
首先看下面的例子，因为并不是所有类型都有length属性，所以就报错了
```typescript
function foo<T>(args: T) {
    console.log(args.length);
    // 这个时候会提示如下错误信息
    // Error: T doesn't have .length
}
```
所以我们需要给泛型T添加一个约束，如下
```typescript
interface HasLength {
    length: number
}
// 因为T可以赋值给HasLength，所以T肯定有length属性
function foo<T extends HasLength>(args: T) {
    console.log(args.length);
}
```

#### 3.条件判断
如下
```typescript
interface Person {
    name: string
}

interface WhitePerson extends Person {
    age: number
}  


type A = WhitePerson extends Person ? string : number
type B = Person extends WhitePerson ? string : number
// 结果：type A = string
// 结果：type B = number
```
在这里的判断规则是，如果extends前面的类型可以赋值给后面的类型，结果判断为真，否则为假

#### 4.分配条件类型
先看示例
```typescript
type A = 'x' extends 'x' ? string : number
// 结果：type A = string
type B = 'x' | 'y' extends 'x' ? string : number
// 结果：type B = number

type P<T> = T extends 'x' ? string : number
type C = P<'x' | 'y'>
// 结果：type C = string | number
```
从上面的式子我们可以做如下的推理，type C = P<'x' | 'y'>，
然后我们把'x' | 'y'替换掉泛型T，得出type C = 'x' | 'y' extends 'x' ? string : number
从最后式子来看，类型B和C是一样的啊，为何最后结果却截然不同了。
这里就牵扯出了extends另一个作用了，__分配条件类型__。
更加直白的话就是，对于使用extends关键字的条件类型（即上面的三元表达式类型），如果extends前面的参数是一个泛型类型，当传入该参数的是联合类型，则使用分配律计算最终的结果。分配律是指，将联合类型的联合项拆成单项，分别代入条件类型，然后将每个单项代入得到的结果再联合起来，得到最终的判断结果。
接下来我们试着推导一下上面type C的结果是如何得出的。
首先
```typescript
type C = P<'x' | 'y'>
```
将联合类型拆分成单项
```typescript
type C = P<'x'> | P<'y'>
```
将T换掉
```typescript
type C = 'x' extends 'x' ? string : number | 'y' extends 'x' ? string : number
```
最后得出结论
```typescript
type C = string | number
```
__特殊类型never__
看下面例子
```typescript
type A = never extends 'x' ? string : number
// 因为never是所有类型的子类型
// 结果：type A = string
type P<T> = T extends 'x' ? string : number
type B = P<never>
// 结果：type B = never
```
为这么这里type B不是string呢，never也不是联合类型啊？
其实这里任然是分配条件类型在起作用，在这里never被当作了 __空的联合类型__
最后因为没有联合类型可以分配，所以最后结果就是never

#### 5.高级类型中的应用
##### Exclude
Exclude的作用是，如果联合类型T中的类型在联合类型U中出现过，就将这个类型删掉，最后只留下没有出现过的类型
源码如下
```typescript
type Exclude<T, U> = T extends U ? never : T
```
看下面例子
```typescript
type A = Exclude<'x' | 'y', 'x'>
// 结果：type A = 'y'
```
推导过程如下
```typescript
type A = Exclude<'x' | 'y', 'x'>
type A = 'x' extends 'x' ? never : 'x' | 'y' extends 'x' ? never : 'y'
type A = never | 'y'
type A = 'y'
```

##### Extract
Extract的作用与Exclude相反，如果联合类型T中的类型在联合类型U中出现过，就将这个类型保留下来
源码如下
```typescript
type Extract<T, U> = T extends U ? T : never
```
推导过程与Exclude一样，在这里就不赘述了


