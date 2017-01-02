<!-- Created by Duncan on 12.28.2016 -->
<template>
  <div class="main-content">
    <ToolBar :word-count="count"></ToolBar>
    <!-- area to add live data as text is being added -->
    <div class="content-left">
      <p>This area is for live data about text</p>
      <p>To see tools hover over tools or far left on screen</p>
    </div>
    <!-- end live data area -->
    <!-- text feild -->
    <div class="content-right">
      <!-- Markdown editor -->
      <!-- Doesn't really compile markdown yet -->
      <div id="editor">
        <textarea :value="input"
        id="content"
        @input="update" @keyup.delete="wordCounter" @keyup.space="wordCounter" @keyup.enter="wordCounter(true)"></textarea>
      </div>
      <!-- end editor -->
    </div>
    <!-- end text feild -->
  </div>
</template>

<script>
  import ToolBar from './tool_bar.vue'
  import Methods from '../js/main_content.js'
  // HTTP calls ect.
  import Utils from '../js/utils.js'

  export default {
    created() {
      // Starts listening on page load
      var channel, conn;
      var content = $("#content");
        // Use the vue-resource $http client to fetch data from the /tasks route
      this.$http.get('/getUrl').then(function(response) {
        console.log('getUrl datas!:', response);
        channel = response;
        console.log(channel)
        conn = new WebSocket('ws://' + window.location.host + '/ws/' + channel);
        console.log('conn',conn)
        this.mychan = conn
        // Textarea is editable only when socket is opened.
        conn.onopen = function(e) {
          console.log('onopen',e);
          content.attr("disabled", false);
        };

        conn.onclose = function(e) {
          console.log('onclose',e);
          content.attr("disabled", true);
        };

        // Whenever we receive a message, update textarea
        conn.onmessage = function(e) {
          console.log('in conn.onmessage',e.data)
          if (e.data != content.val()) {
            console.log('in if',e.data)
            content.val(e.data);
          }
      //fetchChannel(channelSetup)
    };
        // this.onMessage(e);

      });


    },
    data: {input: null, count: null},
    mychan: null,
    components: {
      ToolBar
    },
    // Methods are located in js directory
    methods: Methods
  }
</script>

<style>
  .main-content{
    width: 100vw;
  }
  .content-right{
    border: 1px solid transparent;
    margin-left: 30vw;
    width: 70vw;
    height: 100vh;
  }
  .content-left{
    position: fixed;
    width: 30vw;
  }
  html, body, #editor {
    margin: 0;
    height: 100%;
    color: #333;
    font-family: 'Monaco', courier, monospace;
  }
  textarea, #editor div {
    display: inline-block;
    width: 100%;
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    padding: 0 20px;
  }
  textarea {
    border: none;
    border-right: 1px solid #ccc;
    resize: none;
    outline: none;
    background-color: #f6f6f6;
    font-size: 14px;
    padding: 20px;
  }
  code {
    color: #f66;
  }
</style>