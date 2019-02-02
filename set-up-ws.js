const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

module.exports = setUpWS;

function setUpWS(wss, WebSocket) {

  wss.broadcast = data => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  const usernames = {};

  const broadcastUsernames = () => {
    wss.broadcast(JSON.stringify({
      type: 'users',
      usernames
    }));
  };

  wss.on('connection', ws => {
    // assign ids to client
    ws.publicid = uniqid();
    ws.privateid = bcrypt.hashSync(uniqid(), 0);

    // tell client own ids
    ws.send(JSON.stringify({
      type: 'ids',
      ids: {
        publicid: ws.publicid,
        privateid: ws.privateid
      }
    }));

    // update and broadcast usernames (empty string for new client)
    usernames[ws.publicid] = '';
    broadcastUsernames();

    console.log('client connected, publicid: ' + ws.publicid);
    console.log('current users:');
    console.log(usernames);

    ws.on('message', msgString => {
      const msgObj = JSON.parse(msgString);
      console.log('received msg from client with publicid ' + ws.publicid);
      console.log(msgObj);

      // verify integrity of msgObj, send error message if there's a problem
      if (typeof msgObj !== 'object'
          || 'type' in msgObj === false
          || 'text' in msgObj === false
          || 'time' in msgObj === false
          || 'privateid' in msgObj === false
          || 'publicid' in msgObj === false
          || 'username' in msgObj === false
          || msgObj.type !== 'text'
          || typeof msgObj.text !== 'string'
          || msgObj.privateid !== ws.privateid
          || msgObj.publicid !== ws.publicid) {
        ws.send(JSON.stringify({
          type: 'error',
          errorType: 'badObject',
          errorData: {}
        }));
        console.log('Error: Message from client has wrong schema');
        return;
      }

      // no whitespace allowed at start or end of username
      msgObj.username = msgObj.username.trim();

      // check for attempted change of username
      if (msgObj.username !== usernames[ws.publicid]) {

        // send error message if desired new (non-empty) username is already taken
        if (msgObj.username) {
          const publicids = Object.keys(usernames);
          const publicidOfTakenUsername = publicids.find(id => usernames[id] === msgObj.username);
          if (publicidOfTakenUsername) {
            ws.send(JSON.stringify({
              type: 'error',
              errorType: 'takenUsername',
              errorData: { publicidOfTakenUsername }
            }));
            return;
          }
        }

        // update and broadcast usernames if new username is available (or is empty string)
        usernames[ws.publicid] = msgObj.username;
        broadcastUsernames();
      }

      // if msgObj.text isn't blank, broadcast msgObj (without privateid)
      const thereIsText = msgObj.text.trimStart() ? true : false;
      if (thereIsText) {
        delete msgObj.privateid;
        wss.broadcast(JSON.stringify(msgObj));
      }
    });

    ws.on('close', () => {
      // update and broadcast usernames
      delete usernames[ws.publicid];
      broadcastUsernames();

      console.log('client disconnected, publicid: ' + ws.publicid);
      console.log('current users:');
      console.log(usernames);
    });
  });
}
