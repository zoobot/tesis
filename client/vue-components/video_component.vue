<template>

    <div>
      <div id="buttonContainer">
      <button @click="record()" id="record" >R</button>
      <button @click="download()" id="download" >D</button>
      <button @click="screen()" id="screen" >S</button>
      </div>
      <div id="videocontainer"></div>
      <button vshow="collaborate" @click="start()" id="collaborate" >collaborate++</button>
      <button vshow="connected" @click="call()" id="connect">click to connect</button>
      <button vshow="!ourAudio" @click="toggleMute()" id="mute">unmute yourself</button>
      <button vshow="ourAudio" @click="toggleMute()" id="mute">mute yourself</button>
      <button @click="stop()" id="stop">stop sharing</button>
    </div>


</template>

<script>
  import Utils from '../js/utils.js'
  import Methods from '../js/webrtc.js'
  export default {

    mounted() {
      this.signalHandler();
    },

    props: ['wsrtc','uri'],

    data() {
      return {
        ourAudio: true,
        videos:'',
        collaborate: true,
        connected: false,
        ourAnswer:'',
        otherSDP:'',
        iceCandidates:[],
        pc: null,
        localStream:'',
        theRecorder: null,
        recordedChuck: [],
        peerConnectionConfig: {'iceServers': [{'url': 'stun:stun.l.google.com:19305'}, {'url': 'stun:stun.services.mozilla.com'}]},
      }
    },

    methods: Methods

  }
</script>

<style>
  video {
    display: inlineblock;
    maxwidth: 100%;
  }
  button {
    width: 100%
  }
</style>