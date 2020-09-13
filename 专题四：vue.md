# vue面试必备题

## 1. 发布订阅模式和观察者模式区别

`发布订阅` 有一个中间人（或称代理人），既代理了订阅者的订阅功能（on方法），又代理了发布者的发布功能（emit方法）

`观察者模式` 无需中间人，直接在被观察者身上（如：报社）添加订阅功能（on方法），而本身又有发布功能，直接通知观察者来取报纸

【补充说明】`EventBus`采用了发布订阅模式， `Vue`双向数据绑定采用了观察者模式

## 2. vue响应式原理和数据双向绑定原理

## 3. vue-router原理

## 4. vuex中的mutation和action区别

### 4.1 vuex原理

## 5 虚拟dom
> `虚拟dom`：是用对象来描述dom节点的, `ast语法树`： 是用对象来描述原生语法的

```html
<div id="app">
    <p>hello</p>
</div>
```
``` javascript
/* ast语法树, 跟虚拟dom无关 */
/* type: 1-标签元素  3-文本 */
let root = {
    tag: 'div',
    attrs: [{name: 'id', value: 'app'}],
    parent: null,
    type: 1, 
    children: [
        {
            tag: 'p',
            attrs: [],
            parent: root,
            type: 1,
            children: [{
                text: 'hello',
                type: 3
            }]
        }
    ]
}
```

### 5.1 domdiff

## 6 属性el 、 template、 render渲染优先级
> 默认会先找render方法，没有render会采用tempalte，没有template最后才会采用el内容