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
    <button @click="onClickFindButton">Найти</button>
    <button @click="onClickStopButton">Остановить</button>
    <br>
    <br>
    <div>Результат: {{ result }}</div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';

export default {
  name: 'PersonInput',
  data () {
    return {
      DELAY_TIME: 1000,
      timerID: null,
      personID: '214439',
      myID: '54724',
      result: '',
      version: '15'
    }
  },
  computed: {
    ...mapState(['hand', 'friendsMap', 'usersList', 'hasMatches']),
  },
  watch: {
    hasMatches(val) {
      if (val) {
        const vm = this;
        console.log('hasMatches', val);
        clearInterval(vm.timerID);
        vm.result = vm.hand;
      }
    }
  },
  created () {
    console.log(this);
  },
  methods: {
    findHandshake() {
      console.log('findHandshake');
      let listSlice = {
        first: [],
        second: []
      };
      listSlice.first = this.usersList.first.length < 25
              ? this.usersList.first
              : this.usersList.first.slice(0, 25);
      listSlice.second = this.usersList.second.length < 25
              ? this.usersList.second
              : this.usersList.second.slice(0, 25);
      if (listSlice.first.length !== 0) this.$store.dispatch('getFriendsList',{users: listSlice.first, mapCount: 'first' });
      if (listSlice.second.length !== 0) this.$store.dispatch('getFriendsList', {users: listSlice.second, mapCount: 'second'});
      if (listSlice.first.length !== 0 || listSlice.second.length !== 0) this.$store.commit('spliceUsersList', {first: listSlice.first.length, second: listSlice.second.length});
    },
    onClickFindButton() {
      this.friendsMap.first[this.myID] = {parent: null};
      this.usersList.first.push({id: this.myID, parent: null})
      this.friendsMap.second[this.personID] = {parent: null};
      this.usersList.second.push({id: this.personID, parent: null})
      this.timerID = setInterval(this.findHandshake, this.DELAY_TIME);
    },
    onClickStopButton() {
      const vm = this
      clearInterval(vm.timerID);
      vm.result = [vm.friendsMap.first.length, vm.friendsMap.second.length];
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
