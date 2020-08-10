// 方式1: 使用vue.runtime.esm.js   运行时
// let Test = (msg) => {
//     let TestCom = Vue.extend({
//         // 不能使用template模板形式，因为开发用的 vue.runtime.esm.js 没有加compiler
//         render(h) {
//             return h('div', msg)
//         }
//     });
//     let mtestCom = new TestCom().$mount().$el;
//     document.body.appendChild(mtestCom);
// }


// 方式2： 使用vue.esm.js   运行时 + 编译器
let Test = (msg) => {
    let TestCom = Vue.extend({
        template: '<div class="vue-toast" >' + msg + '</div>',
        // render(h) {
        //     return h('div', msg)
        // }
    });
    let mtestCom = new TestCom().$mount().$el;
    document.body.appendChild(mtestCom);
    // return msg;
}


export default {
    install(Vue, options) {
        Vue.prototype.$msg = Test;
    }
}