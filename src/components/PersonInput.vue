<template>
  <div>
    <b-input-group prepend="Пользователи">
      <b-form-input
              v-model="firstID"
              placeholder="Введите ID первого пользователя"
      ></b-form-input>
      <b-form-input
              v-model="secondID"
              placeholder="Введите ID второго пользователя"
      ></b-form-input>
      <b-input-group-append>
        <b-btn
                variant="outline-success"
                @click="onClickFindButton"
        >
          Найти
        </b-btn>
      </b-input-group-append>
    </b-input-group>
    <div v-if="!hasMatches" class="mt-5 pt-5 d-flex justify-content-around align-items-center">
      <b-img
              src="https://vk.com/images/camera_200.png"
              rounded="circle"
              width="200"
              height="200"
              alt="img"
              class="m-1"
      />
            <b-img
              src="https://vk.com/images/camera_200.png"
              rounded="circle"
              width="200"
              height="200"
              alt="img"
              class="m-1"
      />
    </div>
    <div v-else class="mt-5 d-flex justify-content-around align-items-center">
      <b-img
              v-for="user in result"
              :key="user.user[0].id"
              :src="user.user[0].photo_200_orig"
              rounded="circle"
              width="100"
              height="100"
              alt="img"
              class="m-1"
      />
    </div>
    <span class="fixed-bottom text-right">v.0.{{ version }}</span>
    <div class="fixed-bottom" >
      <b-alert dismissible variant="danger" :show="showFriendMessage">У одного из пользователей нет друзей или они не доступны!</b-alert>
      <b-alert variant="info" :show="isLoading">Идет поиск...</b-alert>
      <b-alert dismissible variant="success" :show="hasMatches && !hasNotFriends">Цепочка друзей найдена!</b-alert>
    </div>
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
      firstID: '2144393',
      secondID: '1547234',
      version: '41',
      isLoading: false,
    }
  },
  computed: {
    ...mapState(['hasNotFriends', 'usersСhains', 'hands', 'friendsMap', 'usersList', 'hasMatches']),
    result() { console.log(this.usersСhains); return this.usersСhains[0] ? this.usersСhains[0].response : [] },
    showFriendMessage: {
      get() { console.log('hasNotFriends', this.hasNotFriends); return this.hasNotFriends },
      set(bool) { console.log('set', bool); this.$store.commit('setHasNotFriends', bool)}
    },
    showChainMessage: {
      get() { return this.hasMatches && !this.hasNotFriends},
      set(bool) { this.$store.commit('setHasMatches', bool) }
    }
  },
  watch: {
    hasMatches(val) {
      if (val) {
        const vm = this;
        console.log(val);
        clearInterval(vm.timerID);
        this.isLoading = false
        this.showResult()
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
      this.$store.commit('resetState');
      this.friendsMap.first[this.firstID] = {parent: null};
      this.usersList.first.push({id: this.firstID, parent: null});
      this.friendsMap.second[this.secondID] = {parent: null};
      this.usersList.second.push({id: this.secondID, parent: null});
      this.timerID = setInterval(this.findHandshake, this.DELAY_TIME);
      this.isLoading = true
    },
    showResult() {
      this.$store.dispatch('getHandsInformation', this.hands.slice(0,2));
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
