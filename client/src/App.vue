<template>
  <div id="app">
    <menu type="context" id="menu">
      <ul class="side-nav">
        <li>
          <div class="user-view">
            <img src="https://pt.gravatar.com/userimage/99657987/b6755a22de17450e7c3f6c73462c9fa4.jpeg" alt="" class="circle">
            <span>Iago C.</span>
          </div>
        </li>
        <li><a href=""><i class="material-icons">home</i></a></li>
        <li><a href=""><i class="material-icons">email</i></a></li>
        <li><a href=""><i class="material-icons">supervisor_account</i></a></li>
        <li><a href=""><i class="material-icons">lock</i></a></li>
        <li><a href=""><i class="material-icons">exit_to_app</i></a></li>
      </ul>    
    </menu>
    <section id="page">
      <header id="header">
        <ul id="dropdown1" class="dropdown-content">
          <li>
            <a href="">Temos 2 novos leads</a>
          </li>
          <li>
            <a href="">Sua campanha teve novos clicks</a>
          </li>
        </ul>
        <nav class="row light-blue">
          <div class="nav-wrapper col s12">
            <a class="brand-logo hide-on-med-and-down" href="">Digital Marketing</a>
            <a class="brand-logo hide-on-large-only" href="">DM</a>
            <ul id="nav-mobile" class="right">
              <li>
                <a class="dropdown-button" data-activates="dropdown1" href="">
                  <i class="material-icons black-text">notifications_active</i>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </header>
      <main id="content">
        <section class="row">
          <div class="col s12">
            <router-view></router-view>
          </div>
        </section>
      </main>
      <footer id="footer" class="row grey lighten-3">
        <div class="col x12">
          <small>Iago Cavalcante</small>
        </div>
      </footer>  
    </section>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  name: 'app',
  mounted () {
    $('.dropdown-button').dropdown({
      belowOrigin: true
    })
  }
}
</script>

<style>
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  
  body {
    background-color: #fafafa !important;
  }

  #page {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
  }

  #footer {
    width: 100%;
    margin-bottom: 0;
  }

  main {
    flex: 1 0 auto;
  }

  #menu {
    text-align: center;
    padding: 0;
    margin: 0;
  }

  #menu .user-view.material-icons {
    display: block;
    font-size: 60px;
  }

  #menu .side-nav, #menu .side-nav li>a>i.material-icons {
    text-align: center;
    color: inherit;
  }

  #menu .side-nav li>a>i.material-icons {
    float: none;
    display: inline-block;
    margin: 0;
    font-size: 30px;
  }

  #menu .side-nav li>a {
    border: 1px solid #424242;
    margin-right: 4px;
    margin-bottom: 4px;
    color: #9e9e9e;
  }

  #menu .side-nav li>a:hover {
    color: #757575;
    background-color: #000000;
  }

  #menu .side-nav {
    transform: translateX(0);
    width: 150px;
    background-color: #212121;
    color: #9e9e9e;
  }

  #menu+#page {
    margin-left: 150px;
  }

  #dropdown1 {
    width: 200px !important;
  }
</style>
