### 1.git reset
在了解git reset之前，需要了解git的工作流程已经它的工作区域，详情点击这里 [工作区 暂存区 本地仓库](../workspace/README.md)
__git reset__ 有三种模式，分别是
* git reset --soft <commit> 温柔的回退
* git reset --mixed <commit> 中等的回退，也是默认的回退方式
* git reset --hard <commit> 强硬的回退
  
从上面可以看出，它们一个比一个回退的多。


#### 1.git reset --soft
git reset --soft在回退的代码的时候，会保留工作区和暂存区的内容，并把回退的那一次的commit内容重新放进暂存区。
光这样说还是比较难理解，我们看一下实例。
首先，运行git log，可以看到我们当前最新commit，记住它的最后4位是01c5

![soft1](./imgs/soft1.png 'soft1')

然后我们在demo.html文件里面随便加点东西，
然后git add . 再运行git commit -m "modify demo.html"
此时再查看git log，会看到多出了一次新的commit提交

![soft2](./imgs/soft2.png 'soft2')

之后我们新建一个文件test.html，然后git add test.html将它添加到暂存区
再在demo.html上随便改点东西，运行git status，得出如下的结果

![soft3](./imgs/soft3.png 'soft3')

此时我们再运行git reset --soft HEAD~1回退到上一次提交的commit，看看会发生什么
运行git log，会发现最新的那一次提交 __modify demo.html__ 没有了，我们回到了01c5那次的提交

![soft4](./imgs/soft4.png 'soft4')

再运行git status，看看结果

![soft5](./imgs/soft5.png 'soft5')

从图中我们可以看出，使用 __--soft__ 回退的时候，工作区和暂存区的内容都保存了下来，而被回退的那次commit内容
被重新放回了暂存区里面。
说白了，使用 __--soft__ 回退只会删除那次commit的提交记录，但是那次commit提交的内容还是会保留下来。

#### 2.git reset --mixed
git reset --mixed是git reset不加参数的情况下的默认方式，使用它回退的代码的话，会保留工作区的内容，并将暂存区以及
回退那次commit的内容放回到工作区内。我们还是看一下实例
首先创建一个abc.html的文件，然后git add . , git commit -m "add abc.html"
此时运行git log，可以看到我们生成了一次新的commit记录

![mixed1](./imgs/mixed1.png 'mixed1')

之后我们新建一个文件test.html，然后git add test.html将它添加到暂存区
再在demo.html上随便改点东西，运行git status，得出如下的结果

![mixed2](./imgs/mixed2.png 'mixed2')

然后我们运行git reset --mixed HEAD~1回退到上一次的提交
之后运行git log，__add abc.html__ 那次提交果然没有了，我们回到了上一次提交

![mixed3](./imgs/mixed3.png 'mixed3')

再看看git status的结果

![mixed4](./imgs/mixed4.png 'mixed4')

不管是暂存区的内容，还是被回退commit的内容都被放回了工作区。

__--soft__ 和 __--mixed__ 作用很相似，都是只删除回退的commit的记录，之前修改的文件都被保留下来了，只不过 __--mixed__ 回把所有东西都重新放回到工作区。

#### 3.git reset --hard
git reset --hard是最好理解的一种方式，也是最暴力的一种方式，不管是工作区的内容，还是暂存区的内容，亦或是被回退的commit的内容，统统不保留，全部删除。看下面操作
我们还是新建一个abc.html文件，然后git add . ，再git commit -m "add abc.html"
运行git log，看到我们有了一次新的commit记录

![hard1](./imgs/hard1.png 'hard1')

我们新增一个test.html文件，然后git add test.html，
之后再修改demo.html文件，
运行git status查看状态

![hard2](./imgs/hard2.png 'hard2')

然后我们git reset --hard HEAD~1回退到上一个commit
运行git log，看到我们成功回退到了上一次的commit

![hard3](./imgs/hard3.png 'hard3')

在运行git status

![hard4](./imgs/hard4.png 'hard4')

之前工作区的和暂存区的内容都没了，被回退的commit的内容都没了，统统都没了。

#### 4.git checkout
说到git checkout，第一想到的就是它是用来切换分支，其实它还有另一个很好用的功能，
那就是回退代码，对它也可以回退代码。
* 第一种用法：git checkout <分支名字> 切换分支
* 第二种用法：git checkout [\<commit\>] [--] \<path\> 回退代码

在这里只讲它第二种用法
首先需要知道commit 和那两根横杠--都是可以省略，
比如 git checkout demo.html，这个语句表示用当前暂存区里demo.html文件内容来覆盖当前工作区里demo.html文件的内容。
看下面例子
首先我们在demo.html随便修改几行代码，运行git status，可以看到demo.html文件变红，说明它被修改过

![checkout1](./imgs/checkout1.png 'checkout1')

然后我们运行git checkout demo.html 或者 git checkout . (.表示覆盖所有的文件)
再运行git status，可以看到demo.html文件已经被还原了

![checkout2](./imgs/checkout2.png 'checkout2')

我们再看，最初demo.html是这个样子
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
</body>
</html>
```

然后我们修改demo.html，加了一行字符串，然后git add demo.html添加到暂存区，
此时的demo.html是这个样子的

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
+++ this is demo file
</body>
</html>
```

运行git status，demo.html被加进了暂存区

![checkout3](./imgs/checkout3.png 'checkout3')

此时我们再给demo.html加一行字符串，长这个样子
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
this is demo file
+++ this is add code
</body>
</html>
```

运行git status，可以看到工作区和暂存区都有一份demo.html内容

![checkout4](./imgs/checkout4.png 'checkout4')

然后运行git checout demo.html，再看demo.html文件内容变成了和暂存区里面的内容一样了

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
this is demo file
</body>
</html>
```

运行git status，可以看到工作区的内容以及被还原了，但是暂存区的内容还在

![checkout5](./imgs/checkout5.png 'checkout5')

如果不省略commit呢
比如git checout \<commit\> -- demo.html，这个就表示用指定的那次commit提交的文件来覆盖当前暂存区和工作区的文件。
举个例子，运行git log获取最新一次commit的值为 b658ad06051002c4c07e0183d6c7710ac8a901c5，如图

![checkout6](./imgs/checkout6.png 'checkout6')

然后给demo.html随便改点东西，之后git add demo.html添加到暂存区里
再在demo.html上随便改点东西，运行git status，查看状态

![checkout7](./imgs/checkout7.png 'checkout7')

然后我们运行git checkout b658ad06051002c4c07e0183d6c7710ac8a901c5 -- demo.html，再git status，看看结果如何

![checkout8](./imgs/checkout8.png 'checkout8')

可以看到暂存区和工作区的demo.html都被还原到b658ad06051002c4c07e0183d6c7710ac8a901c5那次所提交的内容上了。

__补充：__
假设，我们现在有一个分支叫abc，同时也有一个文件叫abc，那么此时运行git checkout abc会发生什么呢？
它会切换到abc分支。如果我想要还原abc文件呢？这个时候就要加双横杠，git checkout -- abc。


#### 5.各种代码回退场景运用

__第一种：__ 我在工作区里面修改了代码，但是还没有git add，此时我想撤销这些文件的修改应该怎么办？
如果只撤销某个文件，比如demo.html，就使用 __git checkout demo.html__
如果要撤销所有文件，就使用 __git checkout .__ 或者 __git reset --hard HEAD__

__第二种：__ 我在工作区里面修改了代码，并且已经通过git add添加到暂存区了，但是还没有git commit，此时又该怎么回退呢？
如果你只是想将暂存区里面的内容回退到工作区，请运行 __git reset --mixed HEAD__ 或者 __git reset HEAD__ 。这样做的话，你修改的内容都还在。
如果你不想保留你修改的内容的话，就运行 __git reset --hard HEAD__ 吧，这样你的文件就被还原成最初的样子了。

__第三种：__ 我在工作区里面修改了代码，并且已经git add了，然后我一不小心把代码git commit了，其实我并不想commit的。
现在我想撤销这次commit，并保留我之前修改的代码，应该怎么做呢？
这种情况直接 __git reset --mixed HEAD__ 或者 __git reset --soft HEAD__ 都可以，只不过 __--soft__ 会将你修改的代码保留在暂存区，__mixed__ 会将你修改的代码保留在工作区。

__第四种：__ 我在工作区修改了代码，并且已经git add了，然后也git commit了，此时正准备git pull远程的分支，最后就可以愉快的git push了。但是突然你走神了，pull错分支了，你当前本来是fix分支的，但是你却pull成dev分支了，此时我想将代码回退到commit的时候，又该怎么办呢？
这种情况呢就比较复杂，我们来一个情景再现。
首先呢，我正在项目的fix上改了一个叫demo.html的文件，然后我一顿操作猛如虎，先git add demo.html
再git commit -m "modify demo.html"。此时运行git log，可以看到我们有了一次新的提交记录

![scene1](./imgs/scene1.png 'scene1')

然后我们再运行git pull origin dev，等代码运行完后才发现，哦豁，卧槽，pull错分支了，这下该如何是好呢。

![doutu1](./imgs/doutu1.gif 'doutu1')

此时我再一次运行了git log，发现多了一次commit记录

![scene2](./imgs/scene2.png 'scene2')

我们知道 git pull = git fetch + git merge，这次新的commit就是merge后自动生成的。
既然如此，那我把最新那一次commit干掉，不就可以达成目的了吗。
但是--soft, --mixed, --hard都可以干掉commit，那么到底选哪个呢？

![doutu2](./imgs/doutu2.jpeg 'doutu2')

当然是选 __--hard__ 了，因为它不会保留git pull后的代码。
之后我们只需要前找到git pull前我们最后一次commit的id就可以了。
运行git log, 得到下面这个东西

![scene3](./imgs/scene3.png 'scene3')

直接运行 __git reset --hard 8be52e937cc6539efef23706d34ccbd3affe622b__ 就可以大功告成
或者运行  __git reset --hard HEAD~1__ 也可以。

另外 __git reflog__ 也可以查找到commitId，看下图

![scene4](./imgs/scene4.png 'scene4')
运行 __git reset --hard 8be52e9__
其中 __8be52e9__ 就是 __8be52e937cc6539efef23706d34ccbd3affe622b__ 前几个字符


最后运行git log，发现我们已经回到了开始的状态

![scene5](./imgs/scene5.png 'scene5')