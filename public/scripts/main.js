const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);
const ids = {}; // one publicid, one privateid, server will send

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setUpMessageInput);
  document.addEventListener('DOMContentLoaded', setUpUsernameInput);
  document.addEventListener('DOMContentLoaded', setUpWebSocketMsgReception);
} else {
  setUpMessageInput();
  setUpUsernameInput();
  setUpWebSocketMsgReception();
}

function setUpMessageInput() {
  const messageInput = document.querySelector('#message-input');
  const usernameInput = document.querySelector('#username-input');
  messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && this.value) {
      const outgoingMsgObj = {
        privateid: ids.privateid,
        publicid: ids.publicid,
        username: usernameInput.value,
        time: Date.now(),
        text: this.value
      };
      ws.send(JSON.stringify(outgoingMsgObj));
      this.value = '';
    }
  });
}

function setUpUsernameInput() {
  document.querySelector('#username-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      const errorMessage = document.querySelector('#error-message');
      errorMessage.textContent = 'Submit a message to update your username.';
    }
  });
}

function setUpWebSocketMsgReception () {
  ws.onmessage = (incomingMsgObj) => {
    console.log(incomingMsgObj);
    const msgData = JSON.parse(incomingMsgObj.data);

    switch (msgData.type) {
      case 'error':
        const errorMessage = document.querySelector('#error-message');
        errorMessage.textContent = msgData.error;
        break;
      case 'ownids':
        ids.publicid = msgData.yourPublicid;
        ids.privateid = msgData.yourPrivateid;
        break;
      case 'users':
        updateUsernamesList(msgData.users, ids.publicid);
        break;
      case 'text':
        processNewTextMsg(msgData, ids.publicid);
        break;
    }

    function updateUsernamesList(usersObj, ownPublicid) {
      const usernamesList = document.querySelector('#usernames-list');
      while (usernamesList.firstChild) {
        usernamesList.removeChild(usernamesList.firstChild);
      }
      const ownUserItem = document.createElement('li');
      ownUserItem.id = 'own-user';
      ownUserItem.setAttribute('data-publicid', ownPublicid)
      usernamesList.appendChild(ownUserItem);
      for (const [publicid, username] of Object.entries(usersObj)) {
        if (publicid === ownPublicid) {
          ownUserItem.textContent = (username) ? `${username} (You)` : '(You)';
        } else {
          const usernameItem = document.createElement('li');
          usernameItem.textContent = username || 'An anonymous user';
          usernameItem.setAttribute('data-publicid', publicid);
          usernamesList.appendChild(usernameItem);
        }
      }
    }

    function processNewTextMsg(msgData, ownPublicid) {
      const viewer = document.querySelector('#messages-viewer');
      const wasScrolledDown = (viewer.scrollHeight - viewer.scrollTop <= viewer.clientHeight + 5);

      const publicid = msgData.publicid;
      const username = (publicid === ownPublicid) ? 'You'
      : (!msgData.username) ? 'An anonymous user'
      : msgData.username;
      const time = new Date(msgData.time);
      const text = msgData.text;

      const newMsg = document.createElement('p');
      const msgUserClass = (publicid === ownPublicid) ? 'own-message' : 'other-message';
      newMsg.classList.add(msgUserClass);
      newMsg.setAttribute('data-time', time);

      const usernameSpan = document.createElement('span');
      usernameSpan.textContent = `${username}: `;
      usernameSpan.classList.add('username-prefix');
      newMsg.appendChild(usernameSpan);

      const textNode = document.createTextNode(text);
      newMsg.appendChild(textNode);

      viewer.appendChild(newMsg);

      // scroll down only if already was nearly scrolled down
      if (wasScrolledDown) {
        viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight; 
      }

      if (publicid === ownPublicid) {
        const errorP = document.querySelector('#error-message');
        errorP.textContent = '';
      }

    }
  }
}
