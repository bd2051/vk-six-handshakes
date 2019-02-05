<template>
  <div>
    v.{{ version }}
    <label>
      firstID
      <input v-model="personID">
    </label>
    <label>
      secondID
      <input v-model="myID">
    </label>
    <button @click="onClickButton">Найти</button>
    <br>
    <br>
    <div>Результат: {{ result }}</div>
  </div>
</template>

<script>
export default {
  name: 'PersonInput',
  data () {
    return {
      personID: '',
      myID: '',
      result: '',
      version: '4'
    }
  },
  created () {
    console.log(this.axios);
  },
  methods: {
    getFrendList(userID) {
      return new Promise((resolve, reject) => {
        console.log(window, window.VK, window.VK);
        window.VK.api('friends.get', {user_id: userID, v: '5.92'}, (vk_resp) => {
          if (vk_resp.error) {
            reject(vk_resp.error)
          }
          resolve(vk_resp)
        })
      })
    },
    onClickButton() {
      this.getFrendList(this.personID).then((response) => {
        console.log(response);
        this.result = response
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
