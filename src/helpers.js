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

export const friehndsExecuteCode = (users) => {
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

export const usersDetailExecuteCode = (hands) => {
  if (hands.length > 25) throw 'Больше 25 запросов';
  let code = 'return [';
  hands.forEach((hand) => {
    code +=               `{` +
                          `"user": API.users.get({"user_id": ${hand.id},"fields": "photo_200_orig"}),` +
  /*hand.friends ? '' : */`"friends": API.friends.get({"user_id": ${hand.id}}).count,` +
                          '},'
  });
  code += '];';
  return code;
};

export const sendBatchRequest = (executeCode) => {
  return new Promise((resolve) => {
    window.VK.api('execute', {code: executeCode}, (vk_resp) => {
      console.log(vk_resp);
      resolve(vk_resp.response)
    })
  })
};

export const calculateHands = (hand, friendsMapWithType) => {
  let tempHand = hand;
  const branch = [];
  while (friendsMapWithType[tempHand].parent) {
    branch.push(friendsMapWithType[tempHand].parent);
    tempHand = friendsMapWithType[tempHand].parent.id;
  }
  return branch;
};
