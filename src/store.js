import Vue from 'vue';
import Vuex from 'vuex';
import {calculateHands, friehndsExecuteCode, sendBatchRequest, usersDetailExecuteCode} from './helpers';

Vue.use(Vuex);

const initState = () => {
  return {
    friendsMap: {
      first: {},
      second: {}
    },
    usersList: {
      first: [],
      second: []
    },
    hands: [],
    usersСhains: [],
    hasNotFriends: false,
    hasMatches: false,
  }
}

export const store = new Vuex.Store({
  state: initState(),

  getters: {
  },

  mutations: {
    resetState (state) {
      Object.assign(state, initState())
    },
    setFriendsMap: (state, { response: friendsMap, mapCount: mapCount }) => {
      const map = state.friendsMap[mapCount];
      const otherMapCount = mapCount === 'first' ? 'second' : 'first';
      for (const key in friendsMap) {
        // проверка на наличие друзей у корневых юсеров
        console.log(key, friendsMap[key].friends);
        if (!friendsMap[key].parent) {
          const hasNotFriends = typeof friendsMap[key].friends === "boolean" || friendsMap[key].friends.items.length === 0;
          if (hasNotFriends) {
            state.hasNotFriends = true;
            state.hasMatches = true;
          }
        }
        // проверка на пересечение первой и второй ветви
        if (state.friendsMap[otherMapCount][key]) {
          state.hasMatches = true;
          state.hands.push(key)
        }
        // проверка на наличие в списке уже заполненого пользователя
        if (!map[key].friens) {
          Vue.set(map, key, friendsMap[key]);
          Vue.set(map[key], 'parent', map[friendsMap[key].parent]);
          // если у пользователя недоступен список друзей выставляем true
          if (!map[key].friends) Vue.set(map[key], 'friends', true);
          else {
            map[key].friends.items.forEach((item) => {
              if (!map[item]) {
                map[item] = {
                  id: item,
                  parent: map[key],
                };
                // заполняем список уникалбных пользователей для запроса к бд вк
                state.usersList[mapCount].push({id: item, parent: key});
              }
            })
          }
        }
      }
    },
    spliceUsersList: (state, sliceLength) => {
      for (let mapCount in state.usersList) {
        state.usersList[mapCount].splice(0, sliceLength[mapCount]);
      }
    },
    setUsersChains(state, chain) {
      state.usersСhains.push(chain.response);
      console.log(state.usersСhains);
    },
    setHasNotFriends(state, bool) {
      state.hasNotFriends = bool
    },
    setHasMathes(state, bool) {
      state.hasMatches = bool
    }
  },

  actions: {
    getHandsInformation: ({ commit, state }, hands) => {
      hands.forEach((hand) => {
        const firstHands = calculateHands(hand, state.friendsMap.first).reverse();
        const secondHands = calculateHands(hand, state.friendsMap.second);
        const commonHands = firstHands.concat(state.friendsMap.first[hand], secondHands);
        sendBatchRequest(usersDetailExecuteCode(commonHands)).then((data) => {
          commit('setUsersChains', {response: data})
        })
      });
    },
    getFriendsList: ({ commit }, { users: users, mapCount: mapCount }) => {
      sendBatchRequest(friehndsExecuteCode(users)).then((data) => {
        commit('setFriendsMap', { response: data, mapCount: mapCount})
      })
    }
  },
});