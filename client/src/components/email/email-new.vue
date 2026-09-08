<template>
  <div class="row">
    <div class="col s12">
      <h5>Nova Campanha</h5>
    </div>
    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <form action="" @submit.prevent="save()">
            <div class="input-field">
              <input type="text" id="campanhaTitle" v-model="data.title">
              <label for="campanhaTitle">Título</label>
            </div>
            <div class="input-field">
              <input type="text" id="campanhaSubject" v-model="data.subject">
              <label for="campanhaSubject">Assunto</label>
            </div>
            <div class="input-field">
              <textarea id="campanhaBody" v-model="data.body" class="materialize-textarea"></textarea>
              <label for="campanhaBody">Conteúdo</label>
            </div>
            <div class="input-field">
              <input type="text" id="campanhaStart" v-model="data.start">
              <label for="campanhaStart">Data de início</label>
            </div>
            <div class="input-field">
              <label>Listas</label>
              <p :key="list._id" v-for="list in lists">
                <label>
                  <input type="checkbox" :value="list._id" v-model="data.lists">
                  <span>{{ list.title }}</span>
                </label>
              </p>
            </div>
            <input type="submit" value="Salvar" class="btn">
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      data: { lists: [] },
      lists: []
    }
  },
  created () {
    this.loadLists()
  },
  methods: {
    loadLists () {
      return window.axios.get('/api/lists').then((res) => {
        this.lists = res.data.data
      })
    },
    save () {
      return this.$store.dispatch('insert', this.data).then(() => {
        this.$router.push('/email')
      })
    }
  }
}
</script>
