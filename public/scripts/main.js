const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);
const ids = {}; // one publicid, one privateid, server will send

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setUpSubmitButton);
  document.addEventListener('DOMContentLoaded', setUpMessageInput);
  document.addEventListener('DOMContentLoaded', setUpWebSocketMsgReception);
} else {
  setUpSubmitButton();
  setUpMessageInput();
  setUpWebSocketMsgReception();
}

function setUpSubmitButton() {
  const messageInput = document.querySelector('#message-input');
  const usernameBox = document.querySelector('#username');
  document.querySelector('#submit-button').addEventListener('click', () => {
    if (messageInput.value) {
      const outgoingMsgObj = {
        privateid: ids.privateid,
        publicid: ids.publicid,
        username: usernameBox.value,
        time: Date.now(),
        text: document.querySelector('#message-input').value
      };
      ws.send(JSON.stringify(outgoingMsgObj));
      document.querySelector('#message-input').value = '';
    }
  });
}

function setUpMessageInput() {
  document.querySelector('#message-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      document.querySelector('#submit-button').click();
    }
  });
}

function setUpWebSocketMsgReception () {
  ws.onmessage = (incomingMsgObj) => {
    console.log(incomingMsgObj);
    const msgData = JSON.parse(incomingMsgObj.data);

    switch (msgData.type) {
      case 'error':
        const errorP = document.querySelector('#error-message');
        errorP.textContent = msgData.error;
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
      const usernameList = document.querySelector('#usernames-list');
      while (usernameList.firstChild) {
        usernameList.removeChild(usernameList.firstChild);
      }
      for (const [publicid, username] of Object.entries(usersObj)) {
        const usernameItem = document.createElement('li');
        usernameItem.textContent = username || 'An anonymous user';
        if (publicid === ownPublicid) {
          usernameItem.textContent = `${username} (You)`;
          usernameItem.classList.add('own-user');
        }
        usernameList.appendChild(usernameItem);
      }
    }

    function processNewTextMsg(msgData, ownPublicid) {
      const viewer = document.querySelector('#message-viewer');
      const isScrolledDown = (viewer.scrollHeight - viewer.scrollTop <= viewer.clientHeight + 5);

      const publicid = msgData.publicid;
      const username = (publicid === ownPublicid) ? 'You'
      : (!msgData.username) ? 'An anonymous user'
      : msgData.username;
      const time = new Date(msgData.time);
      const text = msgData.text;

      const msgUserClass = (publicid === ownPublicid) ? 'own-message' : 'other-message';

      const newMsg = document.createElement ('p');
      newMsg.textContent = `${username} said: ${text}`;
      newMsg.setAttribute('data-time', time);
      newMsg.classList.add(msgUserClass);
      viewer.appendChild(newMsg);

      // scroll down only if already nearly scrolled down
      if (isScrolledDown) {
        viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight; 
      }

      if (publicid === ownPublicid) {
        const errorP = document.querySelector('#error-message');
        errorP.textContent = '';
      }

    }
  }
}
