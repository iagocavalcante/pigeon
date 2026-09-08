<template>
  <div class="row">
    <div class="col s12">
      <h5>Sending Settings</h5>
    </div>
    <div class="col s12">
      <div class="card grey lighten-4">
        <div class="card-content">
          <form action="" @submit.prevent="save()">
            <div class="input-field">
              <input type="text" id="fromAddress" v-model="form.fromAddress">
              <label for="fromAddress" class="active">From address</label>
            </div>
            <div class="input-field">
              <input type="password" id="resendApiKey" v-model="form.resendApiKey" :placeholder="apiKeyPlaceholder">
              <label for="resendApiKey" class="active">Resend API key</label>
            </div>
            <input type="submit" value="Save" class="btn">
            <span v-if="saved" class="saved-message">Saved</span>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data () {
    return {
      form: { fromAddress: '', resendApiKey: '' },
      hasApiKey: false,
      apiKeyHint: null,
      saved: false
    }
  },
  computed: {
    apiKeyPlaceholder () {
      return this.hasApiKey ? `••••${this.apiKeyHint || ''}` : ''
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      return window.axios.get('/oauth/sending').then((res) => {
        this.form.fromAddress = res.data.fromAddress || ''
        this.hasApiKey = res.data.hasApiKey
        this.apiKeyHint = res.data.apiKeyHint
      })
    },
    save () {
      let payload = { fromAddress: this.form.fromAddress }
      if (this.form.resendApiKey) {
        payload.resendApiKey = this.form.resendApiKey
      }
      return window.axios.put('/oauth/sending', qs.stringify(payload)).then((res) => {
        this.form.resendApiKey = ''
        this.hasApiKey = res.data.hasApiKey
        this.apiKeyHint = res.data.apiKeyHint
        this.saved = true
        setTimeout(() => { this.saved = false }, 2000)
      })
    }
  }
}
</script>

<style>
.saved-message {
  margin-left: 12px;
  color: #2e7d32;
}
</style>
