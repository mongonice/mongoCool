import App from './app.vue';
import router from './router/index.js'; // 必须使用./app.vue 而非 app.vue
// import "../../node_modules/lib-flexible/flexible.js"


console.log('测试测试', BOOL)

new Vue({
    el: '#app',
    router, // el是实例挂载点，会将根组件替换掉原文档中id为app的标签
    // template: `<div id="root"></div>`  //如果el + template 那么使用vue.runtime.esm.js 是不行的，会报错，应该使用vue.esm.js
    render: h => h(App)
})