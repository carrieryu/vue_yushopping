import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// import Users from '../components/User/Users.vue'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/User/Users.vue')
// import Rights from '../components/Authority/Rights.vue'
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Authority/Rights.vue')
// import Roles from '../components/Authority/Roles.vue'
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/Authority/Roles.vue')

// import Cate from '../components/Goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Cate.vue')
// import Params from '../components/Goods/Params.vue'
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/Goods/Params.vue')

// import GoodsList from '../components/Goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "goodslist_addgoodspage" */ '../components/Goods/List.vue')
// import AddGoodsPage from '../components/Goods/AddGoodsPage.vue'
const AddGoodsPage = () => import(/* webpackChunkName: "goodslist_addgoodspage" */ '../components/Goods/AddGoodsPage.vue')

// import Orders from '../components/Orders/Orders.vue'
const Orders = () => import(/* webpackChunkName: "orders_report" */ '../components/Orders/Orders.vue')
// import Report from '../components/Report/Report.vue'
const Report = () => import(/* webpackChunkName: "orders_report" */ '../components/Report/Report.vue')
// import Index from '../components/Index.vue'

Vue.use(VueRouter)

const routes = [

]

const router = new VueRouter({
  routes: [
    // {path:'/',component:Index},
    // {path:'/index',component:Index},
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        {path:'/goods/addGoodsPage',component:AddGoodsPage},
        {path:'/orders',component:Orders},
        {path:'/reports',component:Report}
      ]
    }
  ]
})
//拦截路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router


