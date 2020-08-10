import Router from 'vue-router';
Vue.use(Router);

export default new Router({
    routes: [{
        path: '/',
        name: 'SingleScrollNews',
        component: _ => import('../views/singleScrollNews.vue')
    }]
})