<template>

    <div>

        <div>
          <!-- <button @click="start(true)" id="startButton">Start</button> -->
          <button @click="call(true)" id="callButton">Call</button>
          <!-- <button @click="hangup(false)" id="hangupButton">Hang Up</button> -->
        </div>
        <!-- <button @click="stop" id="stopButton">Stop</button> -->
        <div><video id="localVideo" autoplay></video></div><br><br>
        <div><video id="remoteVideo" autoplay></video></div>
    </div>
    <!--need to set remote videos to append to document to accomodate for multiple callers (maybe later feature?)-->
    <!--<div v-el="remoteVideo" id="remoteVideo">-->
    <!--<video id="remoteVideo" autoplay></video>-->

</template>

<style>
  video {
    display: inline-block;
    max-width: 100%;
  }
  button {
    width: 100%
  }
</style>
<script>
  import Utils from '../js/utils.js'
  import Methods from '../js/webrtc.js'
  export default {

    created() {

      // var startButton = document.getElementById('startButton');
      // var callButton = document.getElementById('callButton');
      // var hangupButton = document.getElementById('hangupButton');

      this.start()
      console.log(this.wsRTC)

    },

    props: ['ws', 'wsRTC'],

    data() {
        return {
          serverConnection: this.ws.url + 'rtc',
          peerConnectionConfig: {'iceServers': [{'url': 'stun:stun.l.google.com:19305'}, {'url': 'stun:stun.services.mozilla.com'}]},
          constraints: { audio: false,
            video: {
              mandatory: {
                "minWidth": 640,
                "minHeight": 480
              }
            }
          },
          offerOptions: {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
          },
          pc1:'',
          pc2:'',
          server: '',
          localStream:'',
          remoteStream:'',
          localVideo:'',
          remoteVideo:'',
          userStreamOn: false,

        }
    },

    methods: {
      start() {
        this.userStreamOn = !this.userStreamOn;
        if (this.userStreamOn) {
          navigator.mediaDevices.getUserMedia(this.constraints)
          .then(this.gotStream)
          .catch(e => {console.log('getUserMedia()err: ',  e.name);});
        }
      },

      gotStream(stream) {
        this.localVideo = document.getElementById('localVideo');
        this.localVideo.srcObject = stream;
        this.localStream = stream;
        console.log ('Received local stream', stream);
        // console.log ('this.localVideo.srcObject',this.localVideo.srcObject);
        // console.log ('this.localStream',this.localStream);
      },

      call(isCaller) {
        // instantiate new peer connection
        this.pc1 = new RTCPeerConnection(this.peerConnectionConfig);
        this.pc1.onicecandidate = this.gotIceCandidate;
        // this.pc1.onicecandidate = (e) => {
        //   this.onIceCandidate(pc1, e);
        // };

        this.pc2 = new RTCPeerConnection(this.peerConnectionConfig);
        this.pc2.onicecandidate = this.gotIceCandidate;
        // this.pc2.onicecandidate = (e) => {
        //   this.onIceCandidate(pc2, e);
        // };

        console.log ('this.pc1',this.pc1);
        console.log ('this.pc2',this.pc2);

        // console.log ('this.pc1.onicecandidate',this.pc1.onicecandidate);
        // console.log ('this.pc2.onicecandidate',this.pc2.onicecandidate);

        // this.pc1.oniceconnectionstatechange = (e) => {
        //   onIceStateChange(this.pc1, e);
        // };

        // this.pc2.oniceconnectionstatechange = (e) => {
        //   onIceStateChange(this.pc2, e);
        // };

        // this.pc1.oniceconnectionstatechange;
        // this.pc2.oniceconnectionstatechange;

        this.pc2.onaddstream = this.gotRemoteStream;
        this.pc1.addStream(this.localStream)

        if(isCaller) {
            // console.log('yes is caller', isCaller)
          this.pc1.createOffer(this.offerOptions)
          .then(offer => {
            this.wsRTC.send(JSON.stringify({'sdp': offer}));
            console.log('this is our offer', offer);
          })
          .then(
            this.onCreateOfferSuccess,
            this.onCreateSessionDescriptionError
          )
         }
      },

      onCreateOfferSuccess() {
        this.wsRTC.onmessage = e => {
          this.pc1 = new RTCPeerConnection(this.peerConnectionConfig);
          let signal = JSON.parse(e.data);

            if(signal.sdp) {
              console.log('here is the signal!', signal)
              this.pc1.setRemoteDescription(new RTCSessionDescription(signal.sdp))
              .then(() => console.log('success pc1.setLocalDescription signal.sdp',signal.sdp))
              .catch(err => {console.log('err this.pc1.setLocalDescription', desc, err)})

              this.pc2.setRemoteDescription(new RTCSessionDescription(signal.sdp))
              .then(() => console.log('success pc2.setLocalDescription signal.sdp',signal.sdp))
              .catch(err => {console.log('err this.pc2.setLocalDescription', desc, err)})
              this.pc2.createAnswer()
              .then(this.onCreateAnswerSuccess)
            }
            else if (signal.ice) {
              console.log('in ice', signal.ice)
              let candidate = new RTCIceCandidate(signal.ice);
              this.pc2.addIceCandidate(candidate)
              .then(() => {
                console.log('pc2', this.pc2);
                this.remoteVideo = this.pc2.getRemoteStreams()
                this.pc2 = document.getElementById('remoteVideo');
                for (var stream of this.pc2.onaddstream) {
                  console.log("Remote Stream ID", stream.id)
                }

                console.log('MORE got remote streams ', this.remoteVideo);
                this.pc2.srcObject = this.remoteVideo[0];
                console.log('this is pc2', this.remoteVideo)
              })
            }
        }
      },

      onCreateAnswerSuccess(desc) {
        this.pc2.setLocalDescription(desc)
        .then(() => console.log('success answer this.pc2.setLocalDescription'))
        .catch(err => {console.log('err this.pc2.setLocalDescription', desc, err)})
        this.pc1.setRemoteDescription(desc)
         .then(() => console.log('success answer this.pc1.setLocalDescription'))
        .catch(err => {console.log('err this.pc1.setLocalDescription', desc, err)})
      },

      // (description) => {
      //           this.pc2.setRemoteDescription(new RTCSessionDescription(description))
      //           this.pc1.setRemoteDescription(new RTCSessionDescription(description))
      //         }

      onSetSessionDescriptionError(err) {
        console.log('Failed set session description:',err);
      },

      gotRemoteStream(e) {
        // Add remoteStream to global scope so it's accessible from the browser console
        this.remoteStream = this.remoteVideo.srcObject = e.stream;
        console.log('pc2 received remote stream');
      },



      onIceStateChange(pc, event) {
        if (pc) {
          console.log(getName(pc) + ' ICE state: ' + pc.iceConnectionState);
          console.log('ICE state change event: ', event);
        }
      },

      gotIceCandidate(e) {
        if(e.candidate != null) {
          this.wsRTC.send(JSON.stringify({'ice': e.candidate}));
        }
      },

      onIceCandidate(pc, e) {
        if (e.candidate) {
          getOtherPc(pc).addIceCandidate(new RTCIceCandidate(e.candidate))
          .then(() => { console.log('ice ice baby', pc, e.candidate); })
          .catch((err) => { console.log('ice ice fail', pc, e.candidate); })
        }
      },

      getOtherPc(pc) {
        return (pc === pc1) ? pc2 : pc1;
      },

      getName(pc) {
        return (pc === pc1) ? 'pc1' : 'pc2';
      },

      onStream(event) {
        this.remoteStream
      },

      gotRemoteStream(e) {
        console.log("got remote stream", e.stream);
        this.remoteVideo = e.stream
        this.pc2.Video = document.getElementById('remoteVideo');
        // window.remoteStream = remoteVideo.srcObject = e.stream;
        // console.log('got remote stream', this.remoteVideo[0]);
        // billsVideo.srcObject = this.remoteVideo[0];
        //window.remoteStream = billsVideo.srcObject = this.remoteVideo[0];
        this.pc2.srcObject = e.stream

        // remoteVideo.src = window.URL.createObjectURL(event.stream);
      }

    }
  }
</script>