<template>
  <b-input-group prepend="Пользователи">
    <b-form-input
        v-model="firstLink"
        placeholder="Введите ссылку на пользователя"
    ></b-form-input>
    <b-form-input
        v-model="secondLink"
        placeholder="Введите ссылку на пользователя"
    ></b-form-input>
    <b-input-group-append>
      <b-btn
          variant="outline-success"
          @click="onClickAddButton"
      >
        Добавить
      </b-btn>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
  import {firstSecondNameExecuteCode, sendBatchRequest} from '../helpers';

export default {
  name: 'PersonInput',
  data() {
    return {
      firstLink: '',
      secondLink: ''
    }
  },
  created() {
    sendBatchRequest('return [{"user": API.users.get({"fields": "photo_200_orig,photo_200"}),},];').then((response) => {
      try {
        this.$emit('sendUsersData', {firstUser: response[0].user[0], secondUser: {}});
        this.firstLink = `https://vk.com/id${response[0].user[0].id}`;
      }
      catch (e) {
        console.warn('owner person input', e);
      }
    })
  },
  methods: {
    onClickAddButton() {
      if (this.firstLink.length === 0 || this.secondLink.length === 0) this.$emit('errorInput');
      else {
        const firstId = this.replaceLink(this.firstLink);
        const secondId = this.replaceLink(this.secondLink);
        sendBatchRequest(firstSecondNameExecuteCode([{id: firstId}, {id: secondId}])).then((response) => {
          let firstUser, secondUser;
          if (response[0].user) firstUser = response[0].user[0];
          else this.$emit('errorData', firstId);
          if (response[1].user) secondUser = response[1].user[0];
          else this.$emit('errorData', secondId);
          if (Boolean(firstUser) && Boolean(secondUser)) this.$emit('sendUsersData', {firstUser: firstUser, secondUser: secondUser});
        })
      }
    },
    replaceLink(str) {
      return str.replace(/^https:\/\//, '').replace(/^vk.com\//, '').replace(/^id(?=\d+)/, '');
    }
  }
}
</script>

<style scoped>

</style>