const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

module.exports = { setUpWS };

function setUpWS(wss, WebSocket) {
  const publicUsersObj = { type: 'users', usernames: {} };

  wss.broadcast = data => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  wss.on('connection', ws => {
    ws.publicid = uniqid();
    ws.privateid = bcrypt.hashSync(uniqid(), 0);
    publicUsersObj.usernames[ws.publicid] = '';
    ws.send(JSON.stringify({
      type: 'ids',
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
      if (msgObj.username !== publicUsersObj.usernames[ws.publicid]) {
        // check if username is already taken
        const publicidOfTakenUsername = Object.keys(publicUsersObj.usernames)
            .find(key => publicUsersObj.usernames[key] === msgObj.username);
        // send error message if new username is already taken
        if (msgObj.username && publicidOfTakenUsername) {
          ws.send(JSON.stringify({
            type: 'error',
            error: 'takenUsername',
            publicidOfTakenUsername
          }));
          return;
        }
        publicUsersObj.usernames[ws.publicid] = msgObj.username;
        wss.broadcast(JSON.stringify(publicUsersObj));
      }
      // strip message of privateid before broadcasting
      delete msgObj.privateid;
      wss.broadcast(JSON.stringify(msgObj));
    });

    ws.on('close', () => {
      console.log('client disconnected, publicid: ' + ws.publicid);
      delete publicUsersObj.usernames[ws.publicid];
      console.log(publicUsersObj);
      wss.broadcast(JSON.stringify(publicUsersObj));
    });
  });
}
