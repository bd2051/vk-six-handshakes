<template>
  <div>
    <person-input
        @errorInput="params.showInputError=true"
        @errorData="(link) => params.dataError=link"
        @sendUsersData="(users) => getUsersData(users)"
    />
    <div v-if="!showChainMessage" class="mt-5 pt-5 d-flex justify-content-around align-items-center">
      <div class="rounded">
        <a
              :href="params.firstUser.id ? `https://vk.com/id${params.firstUser.id}` : ''"
              target="_blank"
        >
          <b-img
              :src="firstUserFoto"
              rounded="circle"
              :width="200"
              :height="200"
              :alt="`${params.firstUser.first_name} ${params.firstUser.last_name}`"
              class="m-1"
          />
        </a>
      </div>
      <div style="width: 75px" class="text-center">
        <b-spinner v-if="params.isLoading" variant="success" label="Spinning" />
        <b-btn
            v-else
            :disabled="!params.firstUser.id||!params.secondUser.id"
            variant="outline-success"
            @click="onClickFindButton"
        >
          Найти
        </b-btn>
      </div>
      <div class="rounded">
        <a
              :href="params.secondUser.id ? `https://vk.com/id${params.secondUser.id}` : ''"
              target="_blank"
        >
          <b-img
              :src="secondUserFoto"
              rounded="circle"
              :width="200"
              :height="200"
              :alt="`${params.secondUser.first_name} ${params.secondUser.last_name}`"
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
              :disabled="params.chainsIndex===0"
              variant="success"
              @click="params.chainsIndex--"
          >
            Назад
          </b-button>
          <b-button
              :disabled="params.chainsIndex===(usersСhains.length-1)"
              variant="success"
              @click="params.chainsIndex++"
          >
            Далее
        </b-button>
      </div>
    </div>
    <span class="fixed-bottom text-right">v.0.{{ version }}</span>
    <div class="fixed-bottom" >
      <b-alert dismissible variant="danger" :show="isLimetedFriends">Один из пользователей ограничил себя узким кругом друзей!</b-alert>
      <b-alert dismissible variant="danger" :show="params.dataError.length > 0">Пользователя {{ params.dataError }} не существует!</b-alert>
      <b-alert dismissible variant="danger" :show="params.showInputError">Сперва введите ссылки на страницы пользователей!</b-alert>
      <b-alert dismissible variant="danger" :show="showFriendMessage">У одного из пользователей нет друзей или они не доступны!</b-alert>
      <b-alert variant="info" :show="params.isLoading">Идет поиск...</b-alert>
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
      version: '59',
      params: {
        timerID: null,
        firstUser: {},
        secondUser: {},
        isLoading: false,
        showInputError: false,
        dataError: '',
        chainsIndex: 0,
        counterLimetedFriends: 0,
      },
      paramsCopy: {}
    }
  },
  computed: {
    ...mapState(['hasNotFriends', 'usersСhains', 'hands', 'friendsMap', 'usersList', 'hasMatches']),
    result() { return this.usersСhains[this.params.chainsIndex] ? this.usersСhains[this.params.chainsIndex] : [] },
    showFriendMessage: {
      get() { return this.hasNotFriends },
      set(bool) { this.$store.commit('setHasNotFriends', bool)}
    },
    showChainMessage: {
      get() { return this.hasMatches && !this.hasNotFriends && !this.isLimetedFriends},
      set(bool) { this.$store.commit('setHasMatches', bool) }
    },
    isLimetedFriends() {
      if (this.params.counterLimetedFriends > 4) {
        this.$store.commit('setHasMatches', true);
        console.log(this.params.counterLimetedFriends > 4);
        return true
      }
      return false
    },
    firstUserFoto() {
      return this.params.firstUser.photo_200
        ? this.params.firstUser.photo_200
        : this.params.firstUser.photo_200_orig
          ? this.params.firstUser.photo_200_orig
          : 'https://vk.com/images/deactivated_200.png'
    },
    secondUserFoto() {
      return this.params.secondUser.photo_200
        ? this.params.secondUser.photo_200
        : this.params.secondUser.photo_200_orig
          ? this.params.secondUser.photo_200_orig
          : 'https://vk.com/images/deactivated_200.png'
    }
  },
  watch: {
    hasMatches(val) {
      if (val) {
        const vm = this;
        clearInterval(vm.params.timerID);
        this.params.isLoading = false;
        this.params.chainsIndex = 0;
        this.showResult();
      }
    },
  },
  created () {
    console.log(this);
    this.paramsCopy = Object.assign({}, this.params);
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
      else this.params.counterLimetedFriends++;
      if (listSlice.second.length !== 0) this.$store.dispatch('getFriendsList', {users: listSlice.second, mapCount: 'second'});
      else this.params.counterLimetedFriends++;
      console.log(listSlice.second.length, this.params.counterLimetedFriends);
      if (listSlice.first.length !== 0 || listSlice.second.length !== 0) this.$store.commit('spliceUsersList', {first: listSlice.first.length, second: listSlice.second.length});
    },
    onClickFindButton() {
      this.$store.commit('resetState');
      this.friendsMap.first[this.params.firstUser.id] = {parent: null};
      this.usersList.first.push({id: this.params.firstUser.id, parent: null});
      this.friendsMap.second[this.params.secondUser.id] = {parent: null};
      this.usersList.second.push({id: this.params.secondUser.id, parent: null});
      this.params.timerID = setInterval(this.findHandshake, this.DELAY_TIME);
      this.params.isLoading = true
    },
    showResult() {
      this.$store.dispatch('getHandsInformation', this.hands.slice(0,2));
    },
    getUsersData(users) {
      this.params = Object.assign({}, this.paramsCopy);
      this.$store.commit('resetState');
      this.params.firstUser = users.firstUser;
      this.params.secondUser = users.secondUser;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
