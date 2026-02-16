import qs from 'qs'

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
      return window.axios.post('/api/campaigns', qs.stringify(data)).then((res) => {
        return res
      })
    }
  }
}
