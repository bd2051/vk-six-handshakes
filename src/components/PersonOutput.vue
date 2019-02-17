<template>
  <div>
    <person-input
        @errorInput="showInputError=true"
        @errorData="(link) => dataError=link"
        @sendUsersData="(users) => getUsersData(users)"
    />
    <div v-if="!showChainMessage" class="mt-5 pt-5 d-flex justify-content-around align-items-center">
      <div class="rounded">
        <a
              :href="firstUser.id ? `https://vk.com/id${firstUser.id}` : ''"
              target="_blank"
        >
          <b-img
              :src="firstUser.photo_200 ? firstUser.photo_200 : firstUser.photo_200_orig ? firstUser.photo_200_orig : 'https://vk.com/images/deactivated_200.png'"
              rounded="circle"
              :width="200"
              :height="200"
              :alt="`${firstUser.first_name} ${firstUser.last_name}`"
              class="m-1"
          />
        </a>
      </div>
      <div style="width: 75px" class="text-center">
        <b-spinner v-if="isLoading" variant="success" label="Spinning" />
        <b-btn
            v-else
            :disabled="!firstUser.id||!secondUser.id"
            variant="outline-success"
            @click="onClickFindButton"
        >
          Найти
        </b-btn>
      </div>
      <div class="rounded">
        <a
              :href="secondUser.id ? `https://vk.com/id${secondUser.id}` : ''"
              target="_blank"
        >
          <b-img
              :src="secondUser.photo_200 ? secondUser.photo_200 : secondUser.photo_200_orig ? secondUser.photo_200_orig : 'https://vk.com/images/deactivated_200.png'"
              rounded="circle"
              :width="200"
              :height="200"
              :alt="`${secondUser.first_name} ${secondUser.last_name}`"
              class="m-1"
          />
        </a>
      </div>
    </div>
    <div v-else>
      <div
          class="mt-5 d-flex justify-content-around align-items-center"
          style="min-height: 220px"
      >
        <div
            v-for="user in result"
            :key="user.user[0].id"
            class="rounded"
        >
          <a
              :href="`https://vk.com/id${user.user[0].id}`"
              target="_blank"
          >
            <b-img
                :src="user.user[0].photo_200 ? user.user[0].photo_200 : user.user[0].photo_200_orig"
                rounded="circle"
                :width="180 - result.length * 15"
                :height="180 - result.length * 15"
                :alt="`${user.user[0].first_name} ${user.user[0].last_name}`"
            />
          </a>
        </div>
      </div>
      <div class="d-flex justify-content-between">
          <b-button
              :disabled="chainsIndex===0"
              variant="success"
              @click="chainsIndex--"
          >
            Назад
          </b-button>
          <b-button
              :disabled="chainsIndex===(usersСhains.length-1)"
              variant="success"
              @click="chainsIndex++"
          >
            Далее
        </b-button>
      </div>
    </div>
    <span class="fixed-bottom text-right">v.0.{{ version }}</span>
    <div class="fixed-bottom" >
      <b-alert dismissible variant="danger" :show="dataError.length > 0">Пользователя {{ dataError }} не существует!</b-alert>
      <b-alert dismissible variant="danger" :show="showInputError">Сперва введите ссылки на страницы пользователей!</b-alert>
      <b-alert dismissible variant="danger" :show="showFriendMessage">У одного из пользователей нет друзей или они не доступны!</b-alert>
      <b-alert variant="info" :show="isLoading">Идет поиск...</b-alert>
      <b-alert dismissible variant="success" :show="showChainMessage">Цепочка друзей найдена!</b-alert>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import PersonInput from './PersonInput';

export default {
  name: 'PersonOutput',
  components: {PersonInput},
  data () {
    return {
      DELAY_TIME: 1000,
      timerID: null,
      firstUser: {},
      secondUser: {},
      isLoading: false,
      showInputError: false,
      dataError: '',
      chainsIndex: 0,
      version: '55',
    }
  },
  computed: {
    ...mapState(['hasNotFriends', 'usersСhains', 'hands', 'friendsMap', 'usersList', 'hasMatches']),
    result() { console.log(this.usersСhains); return this.usersСhains[this.chainsIndex] ? this.usersСhains[this.chainsIndex] : [] },
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
        this.isLoading = false;
        this.chainsIndex = 0;
        this.showResult();
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
      this.friendsMap.first[this.firstUser.id] = {parent: null};
      this.usersList.first.push({id: this.firstUser.id, parent: null});
      this.friendsMap.second[this.secondUser.id] = {parent: null};
      this.usersList.second.push({id: this.secondUser.id, parent: null});
      this.timerID = setInterval(this.findHandshake, this.DELAY_TIME);
      this.isLoading = true
    },
    showResult() {
      this.$store.dispatch('getHandsInformation', this.hands.slice(0,2));
    },
    getUsersData(users) {
      this.isLoading = false;
      this.showInputError = false;
      this.dataError = '';
      this.$store.commit('resetState');
      this.firstUser = users.firstUser;
      this.secondUser = users.secondUser;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
