import { createRouter, createWebHistory } from 'vue-router'
import Hello from '../components/Hello.vue'
import Login from '../components/auth/Login.vue'
import store from '../states/index.js'
import EmailList from '../components/email/email-list.vue'
import EmailNew from '../components/email/email-new.vue'
import EmailView from '../components/email/email-view.vue'
import ListsList from '../components/lists/lists-list.vue'

const routes = [
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

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

export default router
