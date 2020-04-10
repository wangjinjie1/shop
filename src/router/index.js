import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Rigths from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Goodcate from '../components/goods/Cate.vue'
import GoodParams from '../components/goods/Params.vue'
import DoodList from '../components/goods/List.vue'
import GoodAdd from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: User
      },
      {
        path: '/rights',
        component: Rigths
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Goodcate
      },
      {
        path: '/params',
        component: GoodParams
      },
      {
        path: '/goods',
        component: DoodList
      },
      {
        path: '/goods/add',
        component: GoodAdd
      },
      {
        path: '/orders',
        component: Order
      },
      {
        path: '/reports',
        component: Report
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // to为将要访问的路径
  // from从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
