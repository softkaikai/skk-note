### 1.git reset
在了解git reset之前，需要了解git的工作流程已经它的工作区域，详情点击这里 [工作区 暂存区 本地仓库](../workspace/README.md)
__git reset__ 有三种模式，分别是
* git reset --soft <commit> 温柔的回退
* git reset --mixed <commit> 中等的回退，也是默认的回退方式
* git reset --hard <commit> 强硬的回退
  
从上面可以看出，它们一个比一个回退的多。