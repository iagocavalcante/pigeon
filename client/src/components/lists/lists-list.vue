<template>
  <div class="row">
    <div class="col s12">
      <h5>Listas de disparo</h5>
    </div>
    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <form action="" @submit.prevent="create()" class="new-list-form">
            <div class="input-field">
              <input type="text" id="newListTitle" v-model="newTitle">
              <label for="newListTitle">Nova lista</label>
            </div>
            <input type="submit" value="Adicionar" class="btn">
          </form>
        </div>
      </div>
    </div>
    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Quantidade</th>
                <th>Link de inscrição</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr :key="list._id" v-for="list in lists">
                <td>{{ list.title }}</td>
                <td>{{ list.quantity || 0 }}</td>
                <td>
                  <code class="subscribe-link">{{ subscribeLink(list) }}</code>
                  <a href="" class="btn-flat" @click.prevent="copyLink(list)">
                    {{ copiedId === list._id ? 'Copiado!' : 'Copiar' }}
                  </a>
                </td>
                <td>
                  <router-link :to="`/lists/${list._id}/leads`" class="btn blue">Leads</router-link>
                  <a href="" class="btn red" @click.prevent="remove(list)">Remover</a>
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
      lists: [],
      newTitle: '',
      copiedId: null
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      return window.axios.get('/api/lists').then((res) => {
        this.lists = res.data.data
      })
    },
    subscribeLink (list) {
      return `${window.location.origin}/subscribe/${list._id}`
    },
    copyLink (list) {
      navigator.clipboard.writeText(this.subscribeLink(list)).then(() => {
        this.copiedId = list._id
        setTimeout(() => { this.copiedId = null }, 2000)
      })
    },
    create () {
      if (!this.newTitle) {
        return
      }
      return window.axios.post('/api/lists', { title: this.newTitle, quantity: 0 }, { headers: { 'Content-Type': 'application/json' } }).then(() => {
        this.newTitle = ''
        return this.load()
      })
    },
    remove (list) {
      return window.axios.delete(`/api/lists/${list._id}`).then(() => {
        return this.load()
      })
    }
  }
}
</script>

<style scoped>
.new-list-form {
  display: flex;
  align-items: center;
  gap: 16px;
}
.subscribe-link {
  font-size: 12px;
  word-break: break-all;
}
</style>
