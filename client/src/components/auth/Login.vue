<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Pigeon</h1>
        <p>Email Marketing Platform</p>
      </div>
      
      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
        >
          Login
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
        >
          Register
        </button>
      </div>

      <form v-if="activeTab === 'login'" @submit.prevent="userLogin()" class="auth-form">
        <div class="form-group">
          <input 
            id="login-email" 
            type="email" 
            v-model="login.username" 
            placeholder="Email"
            required
          >
        </div>
        <div class="form-group">
          <input 
            id="login-password" 
            type="password" 
            v-model="login.password" 
            placeholder="Password"
            required
          >
        </div>
        <button type="submit" class="btn-primary">
          Enter
        </button>
      </form>

      <form v-if="activeTab === 'register'" @submit.prevent="userRegister()" class="auth-form">
        <div class="form-group">
          <input 
            id="register-name" 
            type="text" 
            v-model="register.name" 
            placeholder="Name"
            required
          >
        </div>
        <div class="form-group">
          <input 
            id="register-email" 
            type="email" 
            v-model="register.email" 
            placeholder="Email"
            required
          >
        </div>
        <div class="form-group">
          <input 
            id="register-account" 
            type="text" 
            v-model="register.account_name" 
            placeholder="Account Name"
            required
          >
        </div>
        <div class="form-group">
          <input 
            id="register-password" 
            type="password" 
            v-model="register.password" 
            placeholder="Password"
            required
          >
        </div>
        <button type="submit" class="btn-primary">
          Create Account
        </button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      login: {},
      register: {},
      activeTab: 'login'
    }
  },
  methods: {
    userLogin () {
      this.$store.dispatch('authentication', this.login).then(() => {
        this.$router.push({path: '/'})
      })
    },
    userRegister () {
      this.$store.dispatch('register', this.register).then(() => {
        this.$router.push({path: '/'})
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

.auth-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 10px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: white;
  color: #1a1a2e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-group input:focus {
  outline: none;
  border-color: #1a1a2e;
  background: white;
  box-shadow: 0 0 0 3px rgba(26, 26, 46, 0.1);
}

.form-group input::placeholder {
  color: #9ca3af;
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
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-primary:hover {
  background: #2d2d44;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 26, 46, 0.2);
}
</style>
