<template>
  <div id="app">
    <!--<img src="./assets/logo.png">-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!--<musicbox></musicbox>-->

  </div>
</template>

<script>
  import musicbox from './components/musicbox'
export default {
  name: 'app',
  components:{
      'musicbox':musicbox
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
@media screen and (min-width: 1000px) {
  html {
    background: #d2d5d6;
  }
}
</style>
