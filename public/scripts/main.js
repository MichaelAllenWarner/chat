// "ws" is our global websocket object from setup-websockets.js

const ids = {}; // one publicid, one privateid, server will send

setUpMsgSending();
setUpMsgReceiving();

// scroll chat window down on window resize (not perfect but good for mobile)
window.addEventListener('resize', () => {
  const viewer = document.querySelector('#messages-viewer');
  setTimeout(() => {
    viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight;
  }, 500);
});

function setUpMsgSending() {
  const messageInput = document.querySelector('#message-input');
  const usernameInput = document.querySelector('#username-input');

  messageInput.addEventListener('keydown', sendMsgCallback());
  usernameInput.addEventListener('keydown', sendMsgCallback());

  // should we allow line breaks within a message?

  function sendMsgCallback() {
    return event => {
      const oldUsernameWithYou = document.querySelector('#own-user').textContent;
      const oldUsername = oldUsernameWithYou.substring(0, oldUsernameWithYou.length - 6);
      if (event.key === 'Enter'
          && (messageInput.value || usernameInput.value !== oldUsername)) {
        const outgoingMsgObj = {
          type: 'text',
          privateid: ids.privateid,
          publicid: ids.publicid,
          username: usernameInput.value,
          time: Date.now(),
          text: messageInput.value.trimStart()
        };
        ws.send(JSON.stringify(outgoingMsgObj));
        messageInput.value = '';
      }
    }
  }
}

function setUpMsgReceiving() {
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
      const text = msgData.text.trimStart();

      if (text) {
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
      }

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
