const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

const ids = {}; // one publicid, one privateid, server will send

setUpWSMsgSending();
setUpWSMsgReceiving();

setUpMenuToggle();

setUpResponsiveLayout();


function setUpWSMsgSending() {
  const messageInput = document.querySelector('#message-input');
  const usernameInput = document.querySelector('#username-input');

  messageInput.addEventListener('keydown', sendMsgHandler);
  usernameInput.addEventListener('keydown', sendMsgHandler);

  // should we allow line breaks within a message?

  function sendMsgHandler(event) {
    const ownUserItem = document.querySelector('#own-user');
    const oldUsernameWithYou = ownUserItem ? ownUserItem.textContent : ' (You)';
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

function setUpWSMsgReceiving() {
  ws.onmessage = incomingMsgObj => {
    console.log(incomingMsgObj);
    const msgData = JSON.parse(incomingMsgObj.data);

    switch (msgData.type) {
      case 'ids':
        ids.publicid = msgData.yourPublicid;
        ids.privateid = msgData.yourPrivateid;
        break;
      case 'error':
        communicateError();
        break;
      case 'users':
        updateUsernamesList(msgData.usernames, ids.publicid);
        break;
      case 'text':
        processNewTextMsg(ids.publicid);
        break;
    }

    function communicateError() {
      if (msgData.error === 'takenUsername') {
        const usernameLabel = document.querySelector('#username-label');

        const usernameItemsArr = Array.from(document.querySelectorAll('li'));
        const takenUsernameItem = usernameItemsArr.find(usernameItem =>
          usernameItem.getAttribute('data-publicid') === msgData.publicidOfTakenUsername);

        usernameLabel.addEventListener('animationend', removeClass('bad-username'), { once: true });
        takenUsernameItem.addEventListener('animationend', removeClass('taken-username'), { once: true });

        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');
      }

      function removeClass(classToRemove) {
        return function() {
          this.classList.remove(classToRemove);
        };
      }
    }

    function updateUsernamesList(usernamesObj, ownPublicid) {
      const usernamesList = document.querySelector('#usernames-list');
      while (usernamesList.firstChild) {
        usernamesList.removeChild(usernamesList.firstChild);
      }

      const ownUserItem = document.createElement('li');
      ownUserItem.id = 'own-user';
      ownUserItem.setAttribute('data-publicid', ownPublicid);
      usernamesList.appendChild(ownUserItem);

      for (const [publicid, username] of Object.entries(usernamesObj)) {
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
      const text = msgData.text.trimStart();
      if (text) {
        const publicid = msgData.publicid;
        const username = (!msgData.username) ? 'An anonymous user' : msgData.username;
        const time = new Date(msgData.time);

        const newMsg = document.createElement('p');
        const msgClass = (publicid === ownPublicid) ? 'own-message' : 'other-message';
        newMsg.classList.add(msgClass);
        newMsg.setAttribute('data-time', time);

        const usernamePrefix = document.createElement('span');
        usernamePrefix.textContent = `${username}: `;
        usernamePrefix.classList.add('username-prefix');

        const textNode = document.createTextNode(text);

        newMsg.appendChild(usernamePrefix);
        newMsg.appendChild(textNode);

        const messages = document.querySelector('#messages');
        const scrHgt = messages.scrollHeight;
        const scrTop = messages.scrollTop;
        const cliHgt = messages.clientHeight;
        const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);

        messages.appendChild(newMsg);

        // scroll down messages if already was (nearly) scrolled down
        if (messagesWasScrolledDown) {
          messages.scrollTop = messages.scrollHeight - messages.clientHeight; 
        }
      }
    }
  };
}

function setUpMenuToggle() {
  const menuLogo = document.querySelector('#menu-logo');
  const menu = document.querySelector('#menu');

  menuLogo.addEventListener('click', () => {
    menu.classList.toggle('menu-in');
    menu.classList.toggle('menu-out');
  });

  // hide menu if click/touch outside of menu or menuLogo
  // (touchstart seems to be necessary on iPhone)
  document.addEventListener('touchstart', hideMenu);
  document.addEventListener('click', hideMenu);

  function hideMenu(event) {
    if (menu.classList.contains('menu-in')
        && !menu.contains(event.target)
        && !menuLogo.contains(event.target)) {
      menuLogo.click();
    }
  }
}

function setUpResponsiveLayout() {
  setRealVH();

  window.addEventListener('resize', () => {
    setRealVH();
    scrollToContentWrapperIfNeeded();
    scrollDownMessages();
  });

  function setRealVH() {
    const realVH = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${realVH}px`);
  }

  function scrollToContentWrapperIfNeeded() {
    const activeEl = document.activeElement;
    if (activeEl.classList.contains('content-input')) {
      activeEl.parentNode.parentNode.scrollIntoView(false);
    }
  }

  function scrollDownMessages() {
    const messages = document.querySelector('#messages');
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  }
}
