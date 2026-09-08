<template>
  <div class="row">
    <div class="col s12">
      <h5>Admin</h5>
    </div>

    <div class="col s3" v-for="(value, key) in stats" :key="key">
      <div class="card grey lighten-4">
        <div class="card-content">
          <span class="card-title stat-value">{{ value }}</span>
          <p class="stat-label">{{ key }}</p>
        </div>
      </div>
    </div>

    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <span class="card-title">Configurações</span>
          <p>
            <label>
              <input type="checkbox" v-model="allowRegistration" @change="saveSettings()">
              <span>Permitir novos cadastros</span>
            </label>
          </p>
        </div>
      </div>
    </div>

    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <span class="card-title">Usuários</span>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              <tr :key="user._id" v-for="user in users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <select v-model="user.role" :disabled="isSelf(user)" @change="updateUser(user, { role: user.role })">
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <label>
                    <input
                      type="checkbox"
                      :checked="user.enabled"
                      :disabled="isSelf(user)"
                      @change="updateUser(user, { enabled: $event.target.checked })"
                    >
                    <span>{{ user.enabled ? 'Ativo' : 'Desativado' }}</span>
                  </label>
                </td>
                <td>{{ formatDate(user.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      stats: {},
      users: [],
      allowRegistration: false
    }
  },
  created () {
    this.loadStats()
    this.loadUsers()
    this.loadSettings()
  },
  methods: {
    isSelf (user) {
      let me = this.$store.state.user.me
      return !!(me && me.user && me.user._id === user._id)
    },
    formatDate (value) {
      return value ? new Date(value).toLocaleDateString() : ''
    },
    loadStats () {
      return window.axios.get('/api/admin/stats').then((res) => {
        this.stats = res.data.data || res.data
      })
    },
    loadUsers () {
      return window.axios.get('/api/admin/users').then((res) => {
        this.users = res.data.data
      })
    },
    loadSettings () {
      return window.axios.get('/api/admin/settings').then((res) => {
        let settings = res.data.data || res.data
        this.allowRegistration = !!settings.allowRegistration
      })
    },
    saveSettings () {
      return window.axios.put(
        '/api/admin/settings',
        { allowRegistration: this.allowRegistration },
        { headers: { 'Content-Type': 'application/json' } }
      )
    },
    updateUser (user, changes) {
      return window.axios.patch(
        `/api/admin/users/${user._id}`,
        changes,
        { headers: { 'Content-Type': 'application/json' } }
      ).then(() => {
        return this.loadUsers()
      })
    }
  }
}
</script>

<style scoped>
.stat-value {
  font-size: 28px;
  font-weight: 600;
  display: block;
}
.stat-label {
  text-transform: capitalize;
  color: #6b7280;
}
</style>
