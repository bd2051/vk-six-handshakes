import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const executeCode = (usersID, parentID = false) => {
  return `var value = ${usersID};` +
    ` var parent = ${parentID};` +
    ' var users = API.friends.get({"user_id":  value});' +
    ' var begin = 1;' +
    ' var end;' +
    ' if (users.count>=25) {' +
    ' end = 25;' +
    ' } else { ' +
    ' end = users.count;' +
    ' }' +
    ' var response = [];' +
    ' response.push({' +
    '  "user":  value,' +
    '  "parent": parent,' +
    '  "friends": users' +
    ' });' +
    ' while(begin != end) {' +
    ' begin = begin + 1;' +
    ' response.push( {' +
    '   "user": users.items[begin],' +
    '   "parent":  value,' +
    '   "friends": API.friends.get({"user_id": users.items[begin]})' +
    '   });' +
    ' }' +
    ' return response ;'
}

const sendBatchRequest = (userID, parentID) => {
  return new Promise((resolve, reject) => {
    window.VK.api('execute', {code: executeCode(userID, parentID)}, (vk_resp) => {
      if (vk_resp.error) {
        reject(vk_resp.error)
      }
      resolve(vk_resp)
    })
  })
}

export const store = new Vuex.Store({
  state: {
    friendMap: {},
    methodsList: [],
  },

  getters: {
  },

  mutations: {
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
    getFrendsList ({ commit }, userID, parentID) {
      sendBatchRequest(userID, parentID).then((response) => {
        commit('setFriendMap', response)
      })
    }
  },
});