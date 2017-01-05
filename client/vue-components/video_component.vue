<template>
    <div v-el="localVideo" id="localVideo">
        <!--unsure about model here-->
        <video :model="localVideo" autoplay></video>

        <div>
            <button @click="start" id="startButton">Start</button>
            <button @click="call" id="callButton">Call</button>
            <button @click="hangUp" id="hangupButton">Hang Up</button>
        </div>
    </div>
    <!--need to set remote videos to append to document to accomodate for multiple callers (maybe later feature?)-->
    <div v-el="remoteVideo" id="remoteVideo">
        <!--unsure about model here-->
        <video v-model="remoteVideo" autoplay></video>
    </div>
</template>
<style>
  body {
    font-family: sans-serif;
  }

  video {
    max-width: 100%;
    width: 320px;
  }
</style>
<script>

  import Utils from '../js/utils.js'
  import Methods from '../js/webrtc.js'

  export default {

    created () {

      // Utils.fetchChannel((response) => {
      //   this.channel = response.body;
      //   console.log('this.channel',this.channel);
      //   //set up new websocket server connection for sending SDP descriptions
      //   this.ws = new WebSocket('ws://' + window.location.host + '/ws/' + this.channel);
      //   //listens for SDP offers
      //   this.ws.onmessage = e => {
      //       this.gotMessageFromServer(e.data)
      //   }
      // })

    },

    data() {

        return {
          userStreamOn: false,
          peerConnection: {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]},
          // localVideo: false,
          // remoteVideo: false,
          constraints: { audio: true, video: true },
          // this.ws: new WebSocket('ws://' + window.location.host + '/ws/' + this.channel);
        }

    },

    // components: {

    // },

    methods: {

    //eventually we can port all these methods into a js file
      start() {

        this.userStreamOn = !this.userStreamOn;

        if (this.userStreamOn) {
        console.log('attempting to get video stream')
        //this tells the getUserMedia what data to grab and set in the MediaStream object that the method produces, which is then used in the callback
        //invoke success callback on the MediaStream object that contains the media stream
          navigator.mediaDevices.getUserMedia({ audio: true,video: true })
          .then(gotStream)
          //this.gotStream?
          .catch(function(e) {
          console.log('getUserMedia() error: ' + e.name);
          });
        }

      },

      gotStream(stream) {

        var localVideo = vm.$$.localVideo;

        console.log ('Received local stream');
        //set source of localVideo element to the stream captures from getUserMedia
        localVideo.srcObject = stream;
        // Add localStream to global scope so it's accessible from the browser console
        window.localStream = localStream = stream;

      },

      call () {

      },

      gotMessageFromServer () {

      }



    }

  }

</script>