const https = require('https')
const tls = require('tls')
const fs = require('fs')
const express = require('express')
const ShareDB = require('sharedb')
const Logger = require('sharedb-logger')
const db = require('sharedb-mongo')('mongodb://localhost:27017/data')
const richText = require('rich-text')
const WebSocket = require('ws')
const WebSocketJSONStream = require('websocket-json-stream')
const bodyParser = require('body-parser')


var options = {
  cert : fs.readFileSync("./cert.pem"),
  key  : fs.readFileSync("./key.pem")
};

ShareDB.types.register(richText.type)
const backend = new ShareDB({db})
const logger = new Logger(backend)
startServer()

function startServer() {
  const app = express();
  app.use(express.static(__dirname + '/../client'));
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  const router = require('./routes')(app, express)
  app.use('/', router)

  const server = https.createServer(options, app);

  // Connects any incoming WebSocket connection to ShareDB
  let wss = new WebSocket.Server({server: server});
  wss.on('connection', function(wss, req) {
    let stream = new WebSocketJSONStream(wss)
    backend.listen(stream)
  })

  server.listen(3000)
  console.log('Listening on 3K')
}
