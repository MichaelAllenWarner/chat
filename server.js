const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.static('public'));

const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 3000);

const wss = new WebSocket.Server({ 'server': httpServer });
wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const publicUsersObj = { type: 'users', users: {} };

wss.on('connection', ws => {
  ws.publicid = uniqid();
  ws.privateid = bcrypt.hashSync(uniqid(), 0);
  publicUsersObj.users[ws.publicid] = '';
  ws.send(JSON.stringify({
    type: 'ownids',
    yourPublicid: ws.publicid,
    yourPrivateid: ws.privateid
  }));
  console.log('client connected, publicid: ' + ws.publicid);
  console.log(publicUsersObj);
  wss.broadcast(JSON.stringify(publicUsersObj));

  ws.on('message', msgString => {
    const msgObj = JSON.parse(msgString);
    console.log('received msg from client:');
    console.log(msgObj);
    // verify integrity of msgObj, send error message if there's a problem
    if (typeof msgObj !== 'object'
        || 'type' in msgObj === false
        || 'privateid' in msgObj === false
        || 'publicid' in msgObj === false
        || 'username' in msgObj === false
        || 'time' in msgObj === false
        || 'text' in msgObj === false
        || msgObj.type !== 'text'
        || msgObj.privateid !== ws.privateid
        || msgObj.publicid !== ws.publicid
        || typeof msgObj.text !== 'string') {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'badObject'
      }));
      return;
    }

    // update username if necessary and tell all clients
    if (msgObj.username !== publicUsersObj.users[ws.publicid]) {
      // check if username is already taken
      const publicidOfTakenUsername = Object.keys(publicUsersObj.users)
          .find(key => publicUsersObj.users[key] === msgObj.username);
      // send error message if new username is already taken
      if (msgObj.username && publicidOfTakenUsername) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'takenUsername',
          publicidOfTakenUsername
        }));
        return;
      }
      publicUsersObj.users[ws.publicid] = msgObj.username;
      wss.broadcast(JSON.stringify(publicUsersObj));
    }
    // strip message of privateid before broadcasting
    delete msgObj.privateid;
    wss.broadcast(JSON.stringify(msgObj));
  });

  ws.on('close', () => {
    console.log('client disconnected, publicid: ' + ws.publicid);
    delete publicUsersObj.users[ws.publicid];
    console.log(publicUsersObj);
    wss.broadcast(JSON.stringify(publicUsersObj));
  });
});
