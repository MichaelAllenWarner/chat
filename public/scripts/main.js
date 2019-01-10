// "ws" is our global websocket object from setup-websockets.js

const ids = {}; // one publicid, one privateid, server will send

setUpMsgSending();
setUpMsgReceiving();

// scroll chat window down on window resize
window.addEventListener('resize', () => {
  const viewer = document.querySelector('#messages-viewer');
  // without this delay it doesn't always work in all browsers
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
    return function sendMsgHandler(event) {
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
        
        // hide keyboard on mobile after submit
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgend.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
          this.blur();
        }
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
        communicateError();
        break;
      case 'ownids':
        ids.publicid = msgData.yourPublicid;
        ids.privateid = msgData.yourPrivateid;
        break;
      case 'users':
        updateUsernamesList(msgData.users, ids.publicid);
        break;
      case 'text':
        processNewTextMsg(ids.publicid);
        break;
    }

    function communicateError() {
      if (msgData.error = 'takenUsername') {
        const usernameLabel = document.querySelector('#username-label');
        usernameLabel.addEventListener('animationend', function() {
          this.classList.remove('bad-username');
        });

        let takenUsernameItem;
        const usernamesArr = document.querySelectorAll('li');
        for (let username of usernamesArr) {
          if (username.getAttribute('data-publicid') === msgData.publicidOfTakenUsername) {
            takenUsernameItem = username;
            break;
          }
        }
        takenUsernameItem.addEventListener('animationend', function() {
          this.classList.remove('taken-username');
        });

        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');
      }
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
          ownUserItem.textContent = (username) ? `${username} (You)` : 'An anonymous user (You)';
        } else {
          const usernameItem = document.createElement('li');
          usernameItem.textContent = username || 'An anonymous user';
          usernameItem.setAttribute('data-publicid', publicid);
          usernamesList.appendChild(usernameItem);
        }
      }
    }

    function processNewTextMsg(ownPublicid) {
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

      // scroll down if already was (nearly) scrolled down
      if (wasScrolledDown) {
        viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight; 
      }
    }
  }
}
