import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import store from './states/index.js'
import 'materialize-css/dist/css/materialize.min.css'

require('materialize-css')

const app = createApp(App)

app.use(router)
app.use(store)

app.mount('#app')
