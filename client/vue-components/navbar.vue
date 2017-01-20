
<template>
  <nav class="navbar navbar-fixed-top">
    <div class="left-nav">
    </div>
    <div class="logo"><img src="/client/assets/images/tesis-icon.png" ></div>
    <div class="audio">
      <audiocomponent id="audio" ></audiocomponent>
    </div>
    <div class="title" v-if="this.user.authenticated">
      <p> {{ docData.currentDoc.name || 'New' }} </p>
    </div>
      <!-- Authentication -->
      <div class="auth-area" v-if="!this.user.authenticated">
        <Signin v-if="isLoginShowing" :show-none="showNone"></Signin>
        <div class="user-details" @click="showSignin()"> # </div>
      </div>
    <div class="right-nav" v-if="this.user.authenticated">
        <div class="user-details" @click="showControls()"> {{ user.data.username[0] }} </div>
      <!-- hidden control panel -->
      <div class="user-stuff panel-body" v-if="this.showControl">
        <!-- logout button -->
        <div class="signout-container panel-heading">
          <button class="control-buttons signout fixed-top" @click="logout()">Signout</button>
          <button class="control-buttons" @click="showControls()">Close</button>
        </div>
        <!-- end logout button -->
        <!-- saved documents list -->
        <div class="saved">
          <div class="saved-docs">
              <button v-for="item in docData.docs" :id="item.id" @click="uploadDoc($event.target.id)">
                {{ item.name }}
              </button>
          </div>
          <!-- Save buttons -->
          <div class="save" v-if="this.user.authenticated">
            <button @click="swapSaveAs()" v-if="!savingAs">Save As</button>
            <form v-if="savingAs" @submit.prevent="saveAs">
              <input class="saving-as" type="input" name="save-as" v-model="docName" placeholder="Chapter-9">
            </form>
            <button @click="save()" v-if="docData.currentDoc.name">Save</button>
            <button @click="deleteDoc()" v-if="docData.currentDoc.name">Delete</button>
            <button @click="newDoc()">New</button>
          </div>
          <!-- end Save buttons -->
          <!-- end saved documents list -->
        </div>
        <!-- end hidden control panel -->
      </div>
    </div>
  </nav>
</template>

<script>
  import Methods from '../js/navbar.js'
  import auth from '../js/auth.js'
  import docsave from '../js/docsave.js'
  import Signin from './signin.vue'
  import Signup from './signup.vue'
  import Audiocomponent from './audio_component.vue'
  export default {
    created() {
    },
    data() {
      return {
        user: auth.user,
        docData: docsave.docData,
        showControl: false,
        isLoginShowing: false,
        isSignupShowing: false,
        savingAs: false,
        docName: ''
      }
    },
    components: {
      Audiocomponent,
      Signin,
      Signup
    },
    // Methods are located in js directory
    methods: Methods
  }
</script>

<style>
  .logo img {
    height:100px;
    padding: 10px;
    position: absolute;
    left: 3px;
    top:2px;
  }
  .navbar{
    color: white;
    display: table;
    background-color: rgb(64, 98, 126);
    height: 7.5em;
    width: 100vw;
    border: transparent;
  }
  .title{
    color: rgb(255, 255, 255);
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
  }
  .title, .right-nav{
    text-align: center;
    vertical-align: middle;
  }
  .left-nav, .right-nav, .title{
    display: table-cell;
    height: 100%;
    width: 33.33vw;
  }
  .user-details{
    position: absolute;
    display: flex;
    justify-content: space-around;
    align-items: center;
    top: 2.25em;
    right: 2em;
    cursor: pointer;
    width: 3em;
    height: 3em;
    -moz-border-radius: 3em;
    -webkit-border-radius: 3em;
    border-radius: 3em;
  }
  .avatar{
    cursor: pointer;
  }
  .glyphicon{
    color: rgb(255, 255, 255);
  }
  .user-stuff{border: 1px solid white;
    position: fixed;
    top: 0;
    right: 0;
    width: 30vw;
    min-height: 8em;
    background-color: rgb(24, 24, 24);
    /*overflow: auto;*/
  }
  .saved{border: 1px solid white;
    width: 100%;
    padding-top: 3em;
    min-height: 100%;
    /*overflow: scroll;*/
  }
  .signout-container{
    position: fixed;
    top: 0;
    width: 30vw;
  }
  .control-buttons, .saved-docs button{
    background-color: rgb(24, 24, 24);
  }
  .control-buttons{
    display: inline-block;
    width: 40%;
  }
  .save button{
    color: black;
  }
  .signup, .signin{
    width: 50%;
    display: table-cell;
    background-color: transparent;
    border: none;
    color: rgb(255, 255, 255);
    outline: none;
  }
  .signup-signin button{
    color: white;
    text-decoration: none;
  }
  .signup-signin button:hover{
    cursor: pointer;
    -moz-box-shadow: 0 0 60px rgb(246, 246, 246);
    -webkit-box-shadow: 0 0 60px rgb(246, 246, 246);
    box-shadow: 0 0 60px rgb(246, 246, 246);
  }
  .auth-area{
    position: fixed;
    width: 25vw;
    height: 4em;
    right: 0;
    top: 0.5em;
  }
  .saving-as{
    width: 100%;
  }
</style>
