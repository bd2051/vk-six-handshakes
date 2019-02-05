<template>
  <div id="app">
    <person-input/>
  </div>
</template>

<script>
import PersonInput from './components/PersonInput.vue'

export default {
  name: 'app',
  components: {
    PersonInput
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
</style>
