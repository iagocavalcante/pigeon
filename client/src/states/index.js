import { createStore } from 'vuex'

import user from './modules/user'
import email from './modules/email'

window.axios = require('axios')
window.axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'
window.axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

const store = createStore({
  modules: {
    user: user,
    email: email
  }
})

export default store
