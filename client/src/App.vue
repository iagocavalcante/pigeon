<template>
  <div class="app-container">
    <aside class="sidebar" v-if="me">
      <div class="sidebar-header">
        <h2>Pigeon</h2>
      </div>
      <nav class="sidebar-nav">
        <a href="#/" class="nav-item">
          <span class="nav-icon">🏠</span>
          Home
        </a>
        <a href="#/email" class="nav-item">
          <span class="nav-icon">📧</span>
          Campaigns
        </a>
        <a href="#/lists" class="nav-item">
          <span class="nav-icon">👥</span>
          Lists
        </a>
        <a href="" class="nav-item" @click.prevent="logout">
          <span class="nav-icon">🚪</span>
          Logout
        </a>
      </nav>
    </aside>

    <main class="main-content" v-if="me">
      <header class="top-bar">
        <div class="user-info">
          <span class="user-avatar">{{ userInitial }}</span>
          <span class="user-name">{{ me.user ? me.user.name : 'User' }}</span>
        </div>
      </header>

      <div class="content-area">
        <router-view></router-view>
      </div>

      <footer class="footer">
        <small>by Iago Cavalcante</small>
      </footer>
    </main>

    <div v-if="!me" class="full-page-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    me() {
      return this.$store.state.user.me
    },
    userInitial() {
      if (this.me && this.me.user && this.me.user.name) {
        return this.me.user.name.charAt(0).toUpperCase()
      }
      return 'U'
    }
  },
  methods: {
    logout() {
      window.localStorage.removeItem('token')
      this.$store.commit('updateUser', null)
      this.$store.commit('updateToken', null)
      window.location.href = '#/login'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8f9fa;
  color: #1a1a2e;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
}

.sidebar-nav {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1a1a2e;
}

.nav-icon {
  font-size: 18px;
}

.main-content {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-bar {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 32px;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #1a1a2e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
}

.content-area {
  flex: 1;
  padding: 32px;
}

.footer {
  padding: 16px 32px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.footer small {
  font-size: 12px;
  color: #9ca3af;
}

.full-page-content {
  width: 100%;
}
</style>
