const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

// because of Heroku 55-second timeout:
// ws.onclose = event => {
//   alert('Server idles after 1 minute of inactivity. Refresh page to reconnect.');
// }

const ids = {
  publicid: undefined,
  privateid: undefined
};

setUpWSMsgSending();
setUpWSMsgReceiving();

setUpMenuToggle();

setUpResponsiveLayout();

setUpDarkModeToggle();

function setUpWSMsgSending() {
  const messageInput = document.querySelector('#message-input');
  const usernameInput = document.querySelector('#username-input');

  messageInput.addEventListener('keydown', sendMsgHandler);
  usernameInput.addEventListener('keydown', sendMsgHandler);

  function sendMsgHandler(event) {
    if (event.key === 'Enter') {
      const text = messageInput.value;
      const username = usernameInput.value;

      const ownUserItem = document.querySelector('#own-user');
      const oldUsernameWithYou = ownUserItem ? ownUserItem.textContent : ' (You)';
      const oldUsername = oldUsernameWithYou.substring(0, oldUsernameWithYou.length - 6);

      if (text || username !== oldUsername) {
        const outgoingMsgObj = {
          type: 'text',
          text,
          time: Date.now(),
          privateid: ids.privateid,
          publicid: ids.publicid,
          username
        };
        ws.send(JSON.stringify(outgoingMsgObj));
        messageInput.value = '';
      }
    }
  }
}

function setUpWSMsgReceiving() {
  ws.onmessage = incomingMsgObj => {
    // console.log(incomingMsgObj);
    const msgData = JSON.parse(incomingMsgObj.data);

    switch (msgData.type) {
      case 'ids':
        Object.assign(ids, msgData.ids);
        break;
      case 'error':
        handleError(msgData.errorType, msgData.errorData);
        break;
      case 'users':
        updateUsernamesList(msgData.usernames);
        break;
      case 'text':
        processNewTextMsg(msgData.text, msgData.publicid, msgData.username, msgData.time);
        break;
    }

    function handleError(errorType, errorData) {
      if (errorType === 'takenUsername') {
        const usernameLabel = document.querySelector('#username-label');

        const usernameItemsArr = Array.from(document.querySelectorAll('li'));
        const takenUsernameItem = usernameItemsArr.find(usernameItem =>
          usernameItem.getAttribute('data-publicid') === errorData.publicidOfTakenUsername);

        usernameLabel.addEventListener('animationend', removeClass('bad-username'), { once: true });
        takenUsernameItem.addEventListener('animationend', removeClass('taken-username'), { once: true });

        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');
      }

      function removeClass(className) {
        return function() {
          this.classList.remove(className);
        };
      }
    }

    function updateUsernamesList(usernames) {
      const usernamesList = document.querySelector('#usernames-list');
      while (usernamesList.firstChild) {
        usernamesList.removeChild(usernamesList.firstChild);
      }

      const ownUserItem = document.createElement('li');
      ownUserItem.id = 'own-user';
      ownUserItem.setAttribute('data-publicid', ids.publicid);
      usernamesList.appendChild(ownUserItem);

      for (const [publicid, username] of Object.entries(usernames)) {
        if (publicid === ids.publicid) {
          ownUserItem.textContent = (username) ? `${username} (You)` : 'An anonymous user (You)';
        } else {
          const usernameItem = document.createElement('li');
          usernameItem.textContent = username || 'An anonymous user';
          usernameItem.setAttribute('data-publicid', publicid);
          usernamesList.appendChild(usernameItem);
        }
      }
    }

    function processNewTextMsg(text, publicid, username, time) {
      const newMsg = document.createElement('p');

      newMsg.setAttribute('data-time', new Date(time));

      const className = (publicid === ids.publicid) ? 'own-message' : 'other-message';
      newMsg.classList.add(className);

      const usernamePrefix = document.createElement('span');
      const displayedUsername = (username) ? username : 'An anonymous user';
      usernamePrefix.textContent = `${displayedUsername}: `;
      usernamePrefix.classList.add('username-prefix');
      newMsg.appendChild(usernamePrefix);

      const textNode = document.createTextNode(text);
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
    scrollToContentWrapper();
    scrollDownMessages();
  });

  function setRealVH() {
    const realVH = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${realVH}px`);
  }

  function scrollToContentWrapper() {
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

function setUpDarkModeToggle() {
  const darkModeToggler = document.querySelector('#dark-mode-toggler');
  darkModeToggler.addEventListener('click', () => {
    document.querySelector('html').classList.toggle('dark-mode');
  });
}
