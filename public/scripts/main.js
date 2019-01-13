const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

const isTouchScreen = ('ontouchstart' in document.documentElement); // for working w/ virtual keyboard

const scrollIntoViewOptionsIsSupported = (function test() {
  let res = false;
  const a = document.createElement('a');
  const csy = window.pageYOffset;
  const csx = window.pageXOffset;

  a.style.cssText = 'position: absolute; top: 0px; width: 1px; height: ' + (window.innerHeight + 1) + 'px;';

  // Test
  document.body.appendChild(a);
  a.scrollIntoView({ block: 'end' });
  res = (a.getBoundingClientRect().top === -1);
  document.body.removeChild(a);

  // Revert and return
  window.scrollTo(csx, csy);
  return res;
})();


const ids = {}; // one publicid, one privateid, server will send

// set up websocket behavior
setUpMsgSending();
setUpMsgReceiving();

setUpMenuDropdown();

window.addEventListener('resize', debouncedResizeCallback(setRealViewportHeightVar, scrollDownMessages));
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

        // hide virtual keyboard after submit on touch screens
        if (isTouchScreen) {
          this.blur();
        }
      }
    };
  }

  // mainly for scrolling to relevant div on mobile when soft keyboard comes up
  // b/c the window (vh?) resize triggers #grid-wrapper to change grid-template-rows to 100% 100%,
  // which makes #grid-wrapper scroll all the way up. Note that on some mobile browsers (Safari),
  // the soft keyboard does NOT cause a window (vh?) resize, and the focus-handler
  // gracefully degrades in that case.
  if (isTouchScreen) {
    messageInput.addEventListener('focus', inputFocusHandler);
    usernameInput.addEventListener('focus', inputFocusHandler);
  }

  function inputFocusHandler() {
    const gridWrapper = document.querySelector('#grid-wrapper');

    if (!isInViewport(this.parentNode.parentNode)) {
      gridWrapper.addEventListener('scroll', scrollHandler.bind(this), { once: true });

      // will trigger scrollHandler if window/vh was resized (i.e., not in mobile Safari)
      gridWrapper.scrollBy(0, -1);

      // if scrollHandler wasn't triggered (didn't self-destruct), remove it (i.e., mobile Safari)
      if (gridWrapper.scroll) {
        gridWrapper.removeEventListener('scroll', scrollHandler);
      }
    }

    function scrollHandler() {
      setTimeout(() => {
        let counter = 0;
        const scrollInterval = setInterval(() => {
          if (scrollIntoViewOptionsIsSupported) {
            this.parentNode.scrollIntoView({ behavior: 'smooth', block: 'end' });
          } else {
            this.parentNode.scrollIntoView(false);
          }
          if (isInViewport(this.parentNode.parentNode) || counter === 4) {
            if (gridWrapper.scrollTop > 0) {
              gridWrapper.scrollBy(0, 1);
            }
            clearInterval(scrollInterval);
          }
          counter++
        }, 500);
      }, 500);
    }

    function isInViewport(el) {
      const rect = el.getBoundingClientRect();
      return (rect.top >= 0
              && rect.left >= 0
              && rect.bottom <= (window.innerHeight + 1 || document.documentElement.clientHeight + 1)
              && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    };

    // // a (limited) intervallic do-while (to help guarantee scrolling, safely & cheaply)
    // let counter = 0;
    // const scrollInterval = setInterval(() => {
    //   try {
    //     // after smooth scroll, scroll down a pixel to include div border if necessary
    //     gridWrapper.addEventListener('scroll', () => {
    //       setTimeout(() => {
    //         if (gridWrapper.scrollTop > 0) {
    //           gridWrapper.scrollBy(0, 1);
    //         }
    //       }, 300);
    //     }, { once: true });
    //     this.parentNode.scrollIntoView({ behavior: 'smooth', block: 'end' });
    //   } catch (e) {
    //     gridWrapper.addEventListener('scroll', () => {
    //       setTimeout(() => {
    //         if (gridWrapper.scrollTop > 0) {
    //           gridWrapper.scrollBy(0, 1);
    //         }
    //       }, 300);
    //     }, { once: true });
    //     this.parentNode.scrollIntoView(false);
    //   }
    //   if (isInViewport(this.parentNode) || counter === 3) {
    //     clearInterval(scrollInterval);
    //   }
    //   counter++;
    // }, 300);
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
  document.addEventListener('touchstart', hideMenuCallback());
  document.addEventListener('click', hideMenuCallback());

  function hideMenuCallback() {
    return event => {
      if (menu.classList.contains('menu-in')
          && !menu.contains(event.target)
          && !menuLogo.contains(event.target)) {
        menuLogo.click();
      }
    };
  }
}

function debouncedResizeCallback(setRealViewportHeightVar, scrollDownMessages) {
  // debounce resize event if not on touch screen
  if (!isTouchScreen) {
    let resizeTimer;
    return () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setRealViewportHeightVar();
        scrollDownMessages();
      }, 250);
    }
  } else {
    // debouncing on mobile / touch screen is causing problems
    return () => {
      setRealViewportHeightVar();
      scrollDownMessages();
    };
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
