<template>
  <div class="row">
    <div class="col s12">
      <h5>Leads</h5>
      <router-link to="/lists" class="btn-flat">&larr; Voltar para listas</router-link>
    </div>
    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Nome</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr :key="lead._id" v-for="lead in leads">
                <td>{{ lead.email }}</td>
                <td>{{ lead.name }}</td>
                <td>
                  <span v-if="lead.unsubscribed" class="badge red white-text">Descadastrado</span>
                  <span v-else class="badge green white-text">Ativo</span>
                </td>
                <td>
                  <a href="" class="btn red" @click.prevent="remove(lead)">Remover</a>
                </td>
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
      leads: []
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      return window.axios.get(`/api/leads-by-list/${this.$route.params.id}`).then((res) => {
        this.leads = res.data.data
      })
    },
    remove (lead) {
      return window.axios.delete(`/api/leads/${lead._id}`).then(() => {
        return this.load()
      })
    }
  }
}
</script>

<style scoped>
.badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}
</style>
