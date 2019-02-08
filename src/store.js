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

const executeCode = (users) => {
  if (users.length > 25) throw 'Больше 25 запросов';
  let code = 'return {';
  users.forEach((user) => {
    code += `"${user.id}": {` +
      `"parent": ${user.parent},` +
      `"friends": API.friends.get({"user_id": ${user.id}}),` +
      '},'
  });
  code += '};';
  return code;
};

const sendBatchRequest = (users) => {
  console.log(users);
  return new Promise((resolve, reject) => {
    window.VK.api('execute', {code: executeCode(users)}, (vk_resp) => {
      if (vk_resp.error) {
        reject(vk_resp.error)
      }
      if (vk_resp.execute_errors) console.warn('vk_resp.execute_errors');
      resolve(vk_resp.response)
    })
  })
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
    hand: {}
  },

  getters: {
  },

  mutations: {
    setFriendsMap: (state, { response: friendsMap, mapCount: mapCount}) => {
      console.log('setFriendsMap');
      const map = state.friendsMap[mapCount];
      const otherMapCount = mapCount === 'first' ? 'second' : 'first';
      for (const key in friendsMap) {
        if (state.friendsMap[otherMapCount][key]) {
          state.hasMatches = true;
          state.hand = {userID: key}
        }
        if (!map[key].friens) {
          Vue.set(map, key, friendsMap[key]);
          if (!map[key].friends) Vue.set(map[key], 'friends', true);
          else {
            map[key].friends.items.forEach((item) => {
              if (!map[item]) {
                map[item] = {
                  parent: key,
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
    }
  },

  actions: {
    // getFrendList(userID) {
    //   return new Promise((resolve, reject) => {
    //     window.VK.api('friends.get', {user_id: userID, v: '5.92'}, (vk_resp) => {
    //       if (vk_resp.error) {
    //         reject(vk_resp.error)
    //       }
    //       resolve(vk_resp)
    //     })
    //   })
    // },
    getFriendsList: ({ commit }, { users: users, mapCount: mapCount }) => {
      console.log('getFriendsList');
      sendBatchRequest(users).then((response) => {
        console.log(response);
        commit('setFriendsMap', { response: response, mapCount: mapCount})
      })
    }
  },
});