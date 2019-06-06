import uniqid from 'uniqid';
import bcrypt from 'bcrypt';
import { validateMsg } from './validate-msg.js';
import { sendError } from './send-error.js';

export { setUpWS };

function setUpWS(wss, WebSocket) {

  const usernames = {};

  wss.broadcast = data => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

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

      // validate msgObj, send error message if there's a problem
      const msgObjIsValid = validateMsg(msgObj, ws);
      if (!msgObjIsValid) {
        sendError(ws, 'badObject', {});
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
            sendError(ws, 'takenUsername', { publicidOfTakenUsername });
            return;
          }
        }

        // update and broadcast usernames if new username is available (or is empty string)
        usernames[ws.publicid] = msgObj.username;
        broadcastUsernames();
      }

      // if msgObj.text isn't blank, broadcast msgObj (without privateid)
      const thereIsText = !!msgObj.text.trim();
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
