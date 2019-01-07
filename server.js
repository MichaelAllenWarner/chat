const express = require('express');
const http = require('http');
const SocketServer = require('ws').Server;
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

const app = express()
  .get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
  })
  .use(express.static('public'));

const httpServer = http.createServer(app);

const wss = new SocketServer({ 'server': httpServer });

const publicUsersObj = { type: 'users', users: {} };

wss.on('connection', (ws) => {
  ws.publicid = uniqid();
  ws.privateid = bcrypt.hashSync(uniqid(), 0);
  publicUsersObj.users[ws.publicid] = '';
  ws.send(JSON.stringify({
    type: 'ownids',
    yourPublicid: ws.publicid,
    yourPrivateid: ws.privateid
  }));
  console.log('client connected, publicid:');
  console.log(ws.publicid);
  console.log(publicUsersObj);
  // give all clients updated publicUsersObj
  wss.clients.forEach(client => {
    client.send(JSON.stringify(publicUsersObj));
  });

  ws.on('message', (msgString) => {
    const msgObj = JSON.parse(msgString);
    console.log('received msg from client:');
    console.log(msgObj);
    // verify integrity of msgObj, send error message if there's a problem
    if (typeof msgObj !== 'object'
        || 'privateid' in msgObj === false
        || 'publicid' in msgObj === false
        || 'username' in msgObj === false
        || 'time' in msgObj === false
        || 'text' in msgObj === false
        || msgObj.privateid !== ws.privateid
        || msgObj.publicid !== ws.publicid
        || typeof msgObj.text !== 'string') {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Problem with submitted data. Message delivery failed. You may need to refresh page.'
      }));
      return;
    }
    // update username if necessary and tell all clients
    if (msgObj.username !== publicUsersObj.users[ws.publicid]) {
      // send error message if new username is already taken
      if (Object.values(publicUsersObj.users).includes(msgObj.username)) {
        ws.send(JSON.stringify({
          type: 'error',
          error: 'That username is taken. Try again with a unique handle.'
        }));
        return;
      }
      publicUsersObj.users[ws.publicid] = msgObj.username;
      wss.clients.forEach(client => {
        client.send(JSON.stringify(publicUsersObj));
      });
    }
    delete msgObj.privateid;
    msgObj.type = 'text';
    // broadcast msg to all clients
    wss.clients.forEach(client => {
      client.send(JSON.stringify(msgObj));
    });
  });

  ws.on('close', () => {
    console.log('client disconnected, publicid:');
    console.log(ws.publicid);
    delete publicUsersObj.users[ws.publicid];
    console.log(publicUsersObj);
    wss.clients.forEach(client => {
      if (client.privateid !== ws.privateid) {
        client.send(JSON.stringify(publicUsersObj));
      }
    });
  });
});

httpServer.listen(process.env.PORT || 3000);
