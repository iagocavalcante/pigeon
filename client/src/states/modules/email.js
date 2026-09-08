export default {
  state: {
    emails: [],
    email: {}
  },
  mutations: {
    updateEmails (state, data) {
      state.emails = data
    },
    updateEmail (state, data) {
      state.email = data
    }
  },
  actions: {
    getAll: function (context) {
      return window.axios.get('/api/campaigns').then((res) => {
        context.commit('updateEmails', res.data.data)
        return res
      })
    },
    getOne: function (context, id) {
      return window.axios.get(`/api/campaigns/${id}`).then((res) => {
        context.commit('updateEmail', res.data.data)
        return res
      })
    },
    insert: function (context, data) {
      // Campaigns take a `lists` array; qs.stringify's default bracket format
      // (lists[0]=..) isn't parsed back into an array by the server (express
      // runs its urlencoded parser with extended: false), so send JSON here,
      // which express.json() decodes correctly.
      return window.axios.post('/api/campaigns', data, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
        return res
      })
    }
  }
}
