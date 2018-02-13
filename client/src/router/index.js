import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/auth/Login'
import store from '@/states'
import EmailList from '@/components/email/email-list'
import EmailNew from '@/components/email/email-new'
import EmailView from '@/components/email/email-view'
import ListsList from '@/components/lists/lists-list'
Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/email',
      name: 'EmailList',
      component: EmailList,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/email/new',
      name: 'EmailNew',
      component: EmailNew,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/email/view/:id',
      name: 'EmailView',
      component: EmailView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/lists',
      name: 'ListsList',
      component: ListsList,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    }
  ]})

export default router

router.beforeEach((to, from, next) => {
  let requiresAuth = to.meta.requiresAuth || false

  let token = store.state.user.token

  if (token) {
    window.axios.defaults.headers.common['Authorization'] = 'bearer ' + token
  }

  if (requiresAuth) {
    return store.dispatch('getCurrentUser')
      .then(() => {
        return next()
      })
      .catch(() => {
        return next({path: 'login'})
      })
  }
  return next()
})
