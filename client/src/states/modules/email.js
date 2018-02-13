let qs = require('qs')

export default {
  state: {
    emails: []
  },
  mutations: {
    updateEmails (state, data) {
      state.emails = data
    }
  },
  actions: {
    getAll: function (context) {
      return window.axios.get('/api/campaigns').then((res) => {
        context.commit('updateEmails', res.data.data)
        return res
      })
    },
    insert: function (context, data) {
      return window.axios.post('/api/campaigns', qs.stringify(data)).then((res) => {
        return res
      })
    }
  }
}
