<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Pigeon</h1>
        <p>Inscreva-se para receber novidades</p>
      </div>

      <form v-if="status !== 'success'" @submit.prevent="subscribe()" class="auth-form">
        <div class="form-group">
          <input
            id="subscribe-email"
            type="email"
            v-model="email"
            placeholder="Seu email"
            required
          >
        </div>
        <button type="submit" class="btn-primary">Inscrever</button>
        <p v-if="status === 'not-found'" class="error-message">Lista não encontrada.</p>
        <p v-if="status === 'invalid'" class="error-message">Email inválido.</p>
        <p v-if="status === 'error'" class="error-message">Não foi possível concluir a inscrição.</p>
      </form>

      <p v-else class="success-message">Inscrição realizada com sucesso!</p>
    </div>
  </div>
</template>

<script>
import qs from 'qs'

export default {
  data () {
    return {
      email: '',
      status: null
    }
  },
  methods: {
    subscribe () {
      let payload = { email: this.email, list: this.$route.params.listId }
      return window.axios.post('/leads/subscribe', qs.stringify(payload)).then(() => {
        this.status = 'success'
      }).catch((err) => {
        if (err.response && err.response.status === 404) {
          this.status = 'not-found'
        } else if (err.response && err.response.status === 422) {
          this.status = 'invalid'
        } else {
          this.status = 'error'
        }
      })
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 48px 40px;
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.auth-header p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #1a1a2e;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #1a1a2e;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: #2d2d44;
}

.error-message {
  color: #b91c1c;
  font-size: 13px;
  margin: 0;
}

.success-message {
  color: #2e7d32;
  text-align: center;
  font-size: 15px;
}
</style>
