import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// const executeCode = (usersID, parentID = false) => {
//   return `var value = ${usersID};` +
//     ` var parent = ${parentID};` +
//     ' var users = API.friends.get({"user_id":  value});' +
//     ' var begin = 1;' +
//     ' var end;' +
//     ' if (users.count>=25) {' +
//     ' end = 25;' +
//     ' } else { ' +
//     ' end = users.count;' +
//     ' }' +
//     ' var response = [];' +
//     ' response.push({' +
//     '  "user":  value,' +
//     '  "parent": parent,' +
//     '  "friends": users' +
//     ' });' +
//     ' while(begin != end) {' +
//     ' begin = begin + 1;' +
//     ' response.push( {' +
//     '   "user": users.items[begin],' +
//     '   "parent":  value,' +
//     '   "friends": API.friends.get({"user_id": users.items[begin]})' +
//     '   });' +
//     ' }' +
//     ' return response ;'
// }

const friehndsExecuteCode = (users) => {
  if (users.length > 25) throw 'Больше 25 запросов';
  let code = 'return {';
  users.forEach((user) => {
    code += `"${user.id}": {` +
      `"id": ${user.id},` +
      `"parent": ${user.parent},` +
      `"friends": API.friends.get({"user_id": ${user.id}}),` +
      '},'
  });
  code += '};';
  return code;
};

const usersDetailExecuteCode = (hands) => {
  if (hands.length > 25) throw 'Больше 25 запросов';
  let code = 'return [';
  hands.forEach((hand) => {
    code +=               `{` +
                          `"user": API.users.get({"user_id": ${hand.id}}),` +
  /*hand.friends ? '' : */`"friends": API.friends.get({"user_id": ${hand.id}}).count,` +
                          '},'
  });
  code += '];';
  console.log(code);
  return code;
};

const sendBatchRequest = (executeCode) => {
  return new Promise((resolve, reject) => {
    window.VK.api('execute', {code: executeCode}, (vk_resp) => {
      if (vk_resp.error) {
        reject(vk_resp.error)
      }
      if (vk_resp.execute_errors) console.warn('vk_resp.execute_errors');
      resolve(vk_resp.response)
    })
  })
};

const calculateHands = (hand, friendsMapWithType) => {
  let tempHand = hand;
  const branch = [];
  while (friendsMapWithType[tempHand].parent) {
    branch.push(friendsMapWithType[tempHand].parent);
    tempHand = friendsMapWithType[tempHand].parent.id;
  }
  return branch;
};

export const store = new Vuex.Store({
  state: {
    friendsMap: {
      first: {},
      second: {}
    },
    usersList: {
      first: [],
      second: []
    },
    hasMatches: false,
    hands: [],
    usersСhains: []
  },

  getters: {
  },

  mutations: {
    setFriendsMap: (state, { response: friendsMap, mapCount: mapCount }) => {
      const map = state.friendsMap[mapCount];
      const otherMapCount = mapCount === 'first' ? 'second' : 'first';
      for (const key in friendsMap) {
        if (state.friendsMap[otherMapCount][key]) {
          state.hasMatches = true;
          state.hands.push(key)
        }
        if (!map[key].friens) {
          Vue.set(map, key, friendsMap[key]);
          Vue.set(map[key], 'parent', map[friendsMap[key].parent])
          if (!map[key].friends) Vue.set(map[key], 'friends', true);
          else {
            map[key].friends.items.forEach((item) => {
              if (!map[item]) {
                map[item] = {
                  parent: map[key],
                };
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
      state.usersСhains.push(chain);
      console.log(state.usersСhains);
    },
  },

  actions: {
    getHandsInformation: ({ commit, state }, hands) => {
      hands.forEach((hand) => {
        const firstHands = calculateHands(hand, state.friendsMap.first).reverse();
        const secondHands = calculateHands(hand, state.friendsMap.second);
        const commonHands = firstHands.concat(state.friendsMap.first[hand], secondHands);
        sendBatchRequest(usersDetailExecuteCode(commonHands)).then((response) => {
          console.log(response);
          commit('setUsersChains', {response: response})
        })
      });
    },
    getFriendsList: ({ commit }, { users: users, mapCount: mapCount }) => {
      sendBatchRequest(friehndsExecuteCode(users)).then((response) => {
        commit('setFriendsMap', { response: response, mapCount: mapCount})
      })
    }
  },
});