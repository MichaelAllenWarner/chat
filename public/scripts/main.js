const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

const ids = {}; // one publicid, one privateid, server will send

// set up websocket behavior
setUpMsgSending();
setUpMsgReceiving();

setUpMenuDropdown();

window.addEventListener('resize', resizeCallback(setRealViewportHeightVar, scrollDownMessages));
setRealViewportHeightVar();


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
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
          this.blur();
        }
      }
    };
  }

  // scroll into view on focus (so virtual keyboard isn't in the way on mobile)
  // messageInput.addEventListener('focus', scrollToParentEnd);
  // usernameInput.addEventListener('focus', scrollToParentEnd);

  function scrollToParentEnd() {
    const gridWrapper = document.querySelector('#grid-wrapper');

    // not working totally reliably
    // possible culprits: windows-resize events, css transitions?
    // possible solutions: throttle/debounce resize events, use animationend event listener here?
    setTimeout(() => {
      this.parentNode.scrollIntoView(false);
      if (gridWrapper.scrollTop > 0) {
        gridWrapper.scrollBy(0, 1);
      }
    }, 260);
  }
}

function setUpMsgReceiving() {
  ws.onmessage = (incomingMsgObj) => {
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
      if (msgData.error = 'takenUsername') {
        const usernameLabel = document.querySelector('#username-label');

        const usernameItemsArr = Array.from(document.querySelectorAll('li'));
        const takenUsernameItem = usernameItemsArr.find(usernameItem =>
          usernameItem.getAttribute('data-publicid') === msgData.publicidOfTakenUsername);

        usernameLabel.addEventListener('animationend', removeClass('bad-username'), { once: true });
        takenUsernameItem.addEventListener('animationend', removeClass('taken-username'), { once: true });

        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');

        function removeClass(classToRemove) {
          return function() {
            this.classList.remove(classToRemove);
          };
        }
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
  }
}

function setUpMenuDropdown() {
  const menuLogo = document.querySelector('#menu-logo');
  const menu = document.querySelector('#menu');
  menuLogo.addEventListener('click', () => {
    menu.classList.toggle('menu-in');
    menu.classList.toggle('menu-out');
  });
  document.addEventListener('click', function(event) {
    if (menu.classList.contains('menu-in')
        && !menu.contains(event.target)
        && !menuLogo.contains(event.target)) {
      menuLogo.click();
    }
  });
}

function resizeCallback(setRealViewportHeightVar, scrollDownMessages) {
  return () => {
    const activeEl = document.activeElement;
    const messageInput = document.querySelector('#message-input');
    const usernameInput = document.querySelector('#username-input');
    const gridWrapper = document.querySelector('#grid-wrapper');

    let resizeTimer;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      setRealViewportHeightVar();
      scrollDownMessages();
      if (activeEl === messageInput || activeEl === usernameInput) {
        activeEl.parentNode.scrollIntoView(false);
        if (gridWrapper.scrollTop > 0) {
          gridWrapper.scrollBy(0, 1);
        }
      }
    }, 25);
  }
}

function setRealViewportHeightVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function scrollDownMessages() {
  const messages = document.querySelector('#messages');
  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}
