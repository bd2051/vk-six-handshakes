<template>
  <div>
    <div v-if="hasNotFriends">У одного из пользователей нет друзей или они не доступны!</div>
    v.0.{{ version }};
    <label>
      firstID
      <input v-model="firstID">
    </label>
    <label>
      secondID
      <input v-model="secondID">
    </label>
    <button @click="onClickFindButton">Найти</button>
    <button @click="onClickStopButton">Остановить</button>
    <button @click="showResult">Показать результат</button>
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
      firstID: '214439',
      secondID: '54724',
      version: '32',
    }
  },
  computed: {
    ...mapState(['hasNotFriends', 'usersСhains', 'hands', 'friendsMap', 'usersList', 'hasMatches']),
    result() { return this.usersСhains }
  },
  watch: {
    hasMatches(val) {
      if (val) {
        const vm = this;
        console.log(val);
        clearInterval(vm.timerID);
      }
    },
  },
  created () {
    console.log(this);
  },
  methods: {
    findHandshake() {
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
      this.friendsMap.first[this.firstID] = {parent: null};
      this.usersList.first.push({id: this.firstID, parent: null});
      this.friendsMap.second[this.secondID] = {parent: null};
      this.usersList.second.push({id: this.secondID, parent: null});
      this.timerID = setInterval(this.findHandshake, this.DELAY_TIME);
    },
    onClickStopButton() {
      const vm = this;
      clearInterval(vm.timerID);
      vm.result = [vm.friendsMap.first.length, vm.friendsMap.second.length];
    },
    showResult() {
      this.$store.dispatch('getHandsInformation', this.hands);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
