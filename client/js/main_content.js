// Created by Duncan on 12.29.2016
// Methods for main_content.vu
    // var channel, conn;
    // var content = $("#content");
module.exports = {
  // Function adds each charactor to input
  update(e) {
    this.input = e.target.value
    this.socket(e);
    console.log('this.input',this.input)
    // this.onMessage(e);
    // this.connector();



  },

  socket(e) {
    // console.log('socket e',e)
    // console.log('socket this',this)
    console.log('socket thismychan',this.mychan)
    this.mychan.send(JSON.stringify(this.input));
    this.mychan.onMessage = function(e) {
        console.log('channel is called yay',e.data)
        console.log('channel is called yay thisinput',this.input)
      if (e.data != this.input) {
        console.log('in if',e.data)
        // e.data = "test";
        content.val(this.input);
        // this.input = e.target.value
        // content.input = e.target.value
      }
    };

    this.mychan.onmessage(e);

  },
  channelSetup(response) {
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
        console.log('in if',e.target.value)
      //  e.data = "test";
        //content.val(e.data);
        content.input = e.target.value
      }
    }
  },
  // On each keyup counts amount of words on document
  wordCounter() {
    let splitIt = this.input.split(' ');
    // filters out spaces on each 'delete' or 'spacebar' or 'enter' key up then returns the length.
    this.count = splitIt.filter(val => val !== '').length;
  },

}