// <!-- Created by Duncan on 12.28.2016 -->
import Vue from 'vue'
import Navbar from './vue-components/navbar.vue'
import MainContent from './vue-components/main_content.vue'
// import WebSocket from 'window.WebSocket'
// import  WebSocket from 'ws';
// var ws = new WebSocket('ws://localhost/getUrl');
// Using this package for socket, not sure what will be needed for Go
// import VueSocketio from 'vue-socket.io'
// Websocket connection using vue-socket.io using temp_socket server
// Vue.use(WebSocket, 'http://localhost:3000');


  new Vue({
    el: 'navbar',
    components: { Navbar }
  }),

  // new Vue({
  //   el: 'main-content',
  //   sockets: {
  //     connect() {
  //       console.log('socket connected')
  //     }
  //   },
  //   components: { MainContent }
  // })


new Vue({
  el: 'main-content',
  data: {input: null, count: null},
  // onMessage: function (e) {
  //   new Vue({
  //       el: '#content',
  //       data: {
  //           messages: "test this",
  //           done: true
  //       }
  //   });
  // },
  components: { MainContent }
});
// For testing only
module.exports = {}

