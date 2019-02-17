<template>
  <div id="app">
    <person-output/>
  </div>
</template>

<script>
import PersonOutput from './components/PersonOutput.vue'

export default {
  name: 'app',
  components: {
    PersonOutput
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
}
</style>
