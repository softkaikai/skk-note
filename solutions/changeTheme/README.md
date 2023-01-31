### CSS切换主题
主要还是利用CSS的自定义变量来实现的，通过在根元素:root上设置全局CSS变量
```css
:root {
  --theme-bg-color: red;
  --theme-color: red;
}

.main-bg-color {
  height: 400px;
  background: var(--theme-bg-color);
}
.main-color {
  font-size: 20px;
  color: var(--theme-color);
}
```

然后通过js的setProperty方法来动态的修改主题颜色

```js
const $root = document.querySelector(':root')
$root.style.setProperty('--theme-bg-color', 'orange')
$root.style.setProperty('--theme-color', 'orange')
```

[demo入口](./index.html)

