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


参考资料：[https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability)