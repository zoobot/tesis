<template>

    <div>

        <!-- <button @click="start" id="startButton">Start</button> -->
        <button @click="call(true)" id="callButton">Call</button>
        <!-- <button @click="stop" id="stopButton">Stop</button> -->
        <video id="localVideo" autoplay></video>
        <video id="remoteVideo" autoplay></video>
    </div>
    <!--need to set remote videos to append to document to accomodate for multiple callers (maybe later feature?)-->
    <!--<div v-el="remoteVideo" id="remoteVideo">-->
    <!--<video id="remoteVideo" autoplay></video>-->

</template>

<style>
  video {
    display: inline-block;
    max-width: 100%;
    width: 150px
  }
</style>
<script>
  import Utils from '../js/utils.js'
  import Methods from '../js/webrtc.js'
  export default {

    created() {
      this.start()
      console.log(this.wsRTC)
      console.log('this is the localpeerConnection', this.peerConnectionLocal)
      this.wsRTC.onmessage = e => {
          let peerConnection = new RTCPeerConnection({'iceServers': [{'url': 'stun:stun.l.google.com:19305'}, {'url': 'stun:stun.services.mozilla.com'}]});
          let signal = JSON.parse(e.data);
          //console.log('here is the signal you are sending!', signal)
            if(signal.sdp) {
              peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp),
                () => {
                //console.log('peerConnection 1', peerConnection)
                // this.peerConnectionBill = peerConnection;
                // console.log('peerConnectionBill', this.peerConnectionBill);
                peerConnection.createAnswer()
                .then(answer => {
                  //console.log('SECOND sdp fired off!', answer, this);
                  peerConnection.setLocalDescription(answer);
                  this.wsRTC.send(JSON.stringify({'sdp': answer}));
                  // console.log('peerConnection 2', peerConnection);
                })
                .then(e => {
                  this.peerConnectionBill = peerConnection;
                  // console.log('peerConnectionBill', this.peerConnectionBill);
                })
                .catch(e => { console.log('err answer this.wsRTC.send', e);})
              })
            } else if (signal.ice) {
              // console.log('in ice', signal.ice)
              let candidate = new RTCIceCandidate(signal.ice);
              this.peerConnectionBill.addIceCandidate(candidate)
              .then(() => {
                console.log('success!!');

                // this.remoteVideo = this.peerConnectionBill.getRemoteStreams()[0].getVideoTracks().length = 1
                // &&
                // this.peerConnectionBill.getRemoteStreams()[0].getAudioTracks().length = 1
                // peerConnection.onaddstream = this.peerConnectionBill.getRemoteStreams();
                // console.log('peerConnection.onaddstream', peerConnection.onaddstream);
                this.remoteVideo = this.peerConnectionBill.getRemoteStreams();
                let billsVideo = document.getElementById('remoteVideo');
                console.log('got remote stream', this.remoteVideo[0]);
                console.log('got local stream', this.localVideo[0]);
                billsVideo.srcObject = this.remoteVideo[0];
                // billsVideo.srcObject = peerConnection.onaddstream[0];
                console.log('this is bill', billsVideo)
              })
            }
        }
    },

    props: ['ws', 'wsRTC'],

    data() {
        return {
          // wsRTC: null,
          peerConnectionLocal: null,
          server: '',
          serverConnection: this.ws.url + 'rtc',
          localStream:'',
          localVideo:'',
          remoteVideo:'',
          userStreamOn: false,
          peerConnectionBill:'',
          // peerConnectionConfig: {'iceServers': [{'url': 'stun:stun.l.google.com:19305'}, {'url': 'stun:stun.services.mozilla.com'}]},
          constraints: { audio: false, video: true }
        }
    },

    methods: {
    //eventually we can port all these methods into a js file
      start() {
        this.userStreamOn = !this.userStreamOn;
        if (this.userStreamOn) {
        //this tells the getUserMedia what data to grab and set in the MediaStream object that the method produces,
        //which is then used in the success callback on the MediaStream object that contains the media stream
          navigator.mediaDevices.getUserMedia({ audio: false,video: true })
          .then(this.gotStream)
          .catch(e => { console.log('getUserMedia() error: ' + e.name);});
        }
      },
      stop(stream) {
        //for (let track of stream.getTracks()) {
          //track.stop();
      //  }
        // this.userStreamOn = !this.userStreamOn;
        // mediaStream.stop();
        // localMediaStream.stop()
      },
      gotStream(stream) {
        this.localVideo = document.getElementById('localVideo');
        //NOTE: refer back to global scope data object here!!
        console.log ('Received local stream', stream);
        //set source of localVideo element to the stream captures from getUserMedia
        this.localVideo.srcObject = stream;
        console.log ('this.localVideo.srcObject',this.localVideo.srcObject);
        // set localStream equal to this stream
        this.localStream = stream;
      },

      call(isCaller) {
        // instantiate new peer connection
        let peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
        this.peerConnectionLocal = peerConnection;
        // // set methods on new peer connection object
        peerConnection.onicecandidate = this.gotIceCandidate;
        // peerConnection.onaddstream = this.gotRemoteStream;
        peerConnection.addStream(this.localStream)
        if(isCaller) {
            peerConnection.createOffer()
           .then(offer => {
           peerConnection.setLocalDescription(offer);
           this.wsRTC.send(JSON.stringify({'sdp': offer}));
           console.log('this is our offer', offer)})
           .catch(e => { console.log('err', e);})
         }
      },

      gotIceCandidate(e) {
        if(event.candidate != null) {
          this.wsRTC.send(JSON.stringify({'ice': e.candidate}));
        }
      },

      gotRemoteStream(e) {
        console.log("got remote stream", e.stream);
        console.log('this is bill', billsVideo)
        // this.remoteVideo = this.peerConnectionBill.getRemoteStreams();
        let billsVideo = document.getElementById('remoteVideo');
        // console.log('got remote stream', this.remoteVideo[0]);
        // billsVideo.srcObject = this.remoteVideo[0];
        //window.remoteStream = billsVideo.srcObject = this.remoteVideo[0];
        billsVideo.srcObject = e.stream

        // remoteVideo.src = window.URL.createObjectURL(event.stream);
      }

    }
  }
</script>