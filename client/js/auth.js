import Vue from 'vue'
import VueResource from 'vue-resource'
import docsave from './docsave.js'
import editor from '../js/editor.js'

Vue.use(VueResource);
const PORT = 8443;
// const USER_URL = ' https://98e168f1.ngrok.io';
const USER_URL = `https://${window.location.hostname}:${PORT}`;
const eValidate = require('email-validator');
const crypto = require('crypto'),
      algorithm = 'aes-256-ctr',
      password = 'farfegnugen';

Vue.use(VueResource);

export default {
  // user object will let us check if the user is authenticate and is where user data will be stored.
  user: {
    authenticated: false,
    data: {}
  },
  signup(context, creds, cb) {
    context.$http.post(`${USER_URL}/db/user/signup`, creds)
      .then((res) => {

        let data = JSON.parse(res.body);
        let status = JSON.parse(res.status);
        console.log('signup res.body', res.body)
        console.log('signup res.status', res.status)
        this.user.data = data;
        this.user.authenticated = true;
        localStorage.setItem('id_token', data.id);
        this.jwt(context, data.id);
        docsave.getAllDocs(context, data.username);
        cb();
      })
      .catch((err) => {
        context.error = true;
        context.error = 'This user name already exits!';
      });
  },

  signin(context, creds, cb) {
    context.$http.post(`${USER_URL}/db/user/signin`, creds)
      .then((res) => {
        console.log(' \n signin res.body', res.body)
        console.log('signin res.status', res.status)
        if (res.body !== null) {
          this.user.authenticated = true;
          let data = JSON.parse(res.body);
          this.user.data = data;
         localStorage.setItem('id_token', data.id);
          this.jwt(context, data.id);
          docsave.getAllDocs(context, data.username);
          let status = JSON.parse(res.status);
          console.log(' \n signin this.user.data', data)
          console.log(' \n signin this.user.authenticated', this.user.authenticated)
          // Sets token in local storage, this is the only place that
          // can set a token, this ensures a falty token can't be set.
          console.log('signin docsave', context)
        }


      })
      .catch((err) => {
        context.error = true;
        console.log('signin context error \n', err, context.error)
      });
  },

  getUser(context, query) {
    context.$http.get(`${USER_URL}/db/user`, {params: {'id': query}})
      .then((res) => {
        console.log('getUser res.body', res.body)
        console.log('getUser res.status', res.status)
        let data = JSON.parse(res.body);
        let status = JSON.parse(res.status);
        this.user.data = data[0];
        this.user.authenticated = true;
        docsave.getAllDocs(context, data[0].username);
      })
      .catch((err) => {
        throw err;
      });
  },

  jwt(context, id) {
    let token = {
      userid: id,
      logintime: Date.now(),
      // id_token: 'whatisup' + data.username// Temp!!!
    };

    context.$http.post(`${USER_URL}/db/sessions/createsession`, token)
      .then((res) => {
        let status = JSON.parse(res.status);
        let data = JSON.parse(res.body);
      })
      .catch((err) => {
        context.error = err;
      });
  },

  getJwt(context, query) {
    context.$http.get(`${USER_URL}/db/sessions`, {params: {'userid': query}})
      .then((res) => {
        let status = JSON.parse(res.status);
        let data = JSON.parse(res.body);
        if (res.status === 200) {
          this.getUser(context, data[0].userid);
        }
      })
      .catch((err) => {
        throw err;
      })
  },

  logout() {
    localStorage.removeItem('id_token');
    this.user.authenticated = false;
    this.user.data = {};
    docsave.docData.currentDoc = {
      name: '',
      doc: ''
    };
    docsave.docData.docs = [];
    editor.quill.deleteText(0);
  },

  // The object to be passed as a body for authentication requests
  getAuthHeader() {
    return {
      UserId: this.getToken(),
      logintime: Date.now()
    }
  },

  getToken() {
    return localStorage.getItem('id_token');
  },

  // Helpers,
  verifyEmail(email) {
    // Only checking format currently. Will implement confirmation email later.
    return eValidate.validate(email);
  },

  verifyPassword(pw) {
    // Minimum 8 characters at least 1 Alphabet, 1 Number and 1 Special Character:
    // FishyTreat1!
    return pw.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/) ? true : false;
  },

  getUserData() {
    return this.user;
  },

  encrypt(text){
    const cipher = crypto.createCipher(algorithm,password)
    let crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  },

  decrypt(text){
    const decipher = crypto.createDecipher(algorithm,password)
    let dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
  }
}
