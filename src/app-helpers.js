import React from 'react';

const menuToggler = state =>
  state.menuClass === 'menu-out'
    ? { menuClass: 'menu-in' }
    : { menuClass: 'menu-out' };

const menuOutIfIn = state =>
  state.menuClass === 'menu-in'
    ? { menuClass: 'menu-out' }
    : null;

const generateUsernameAndUsernamesSetter = receivedUsernames => {
  return function setUsernameAndUsernames(state) {
    let newUsername;
    const newUsernames = [];
    for (const [publicid, username] of receivedUsernames) {
      this[`${publicid}Ref`] = React.createRef();
      if (publicid === state.ids.publicid) {
        newUsername = username;
        newUsernames.unshift( // so own username is always listed first
          <li
            key={publicid}
            id='own-user'
            data-publicid={publicid}
            ref={this[`${publicid}Ref`]}
          >
            {username ? `${username} (You)` : 'An anonymous user (You)'}
          </li>
        );
      } else {
        newUsernames.push(
          <li
            key={publicid}
            data-publicid={publicid}
            ref={this[`${publicid}Ref`]}
          >
            {username || 'An anonymous user'}
          </li>
        );
      }
    }
    return {
      username: newUsername,
      usernames: newUsernames
    };
  };
};

const generateMessageSetter = msgData => {
  return function setMessages(state) {
    const newMessages = [...state.messages];
    newMessages.push(
      <p
        key={msgData.time} // guaranteed unique? maybe include publicid somehow?
        data-time={new Date(msgData.time)}
        className={msgData.publicid === state.ids.publicid ? 'own-message' : 'other-message'}
      >
        <span className='username-prefix'>
          {msgData.username || 'An anonymous user'}:&nbsp;
        </span>
        {msgData.text}
      </p>
    );
    return { messages: newMessages };
  };
};

const errorHandler = function(msgData) {
  const errorType = msgData.errorType;
  const errorData = msgData.errorData;

  switch (errorType) {
    case 'badObject': {
      window.alert('Error: Stop trying to hack me!');
      break;
    }
    case 'takenUsername': { // IS THERE A MORE REACT-Y WAY TO DO THIS?
      const usernameLabel = this.usernameLabelRef.current;
      const takenUsernameItem = this[`${errorData.publicidOfTakenUsername}Ref`].current;

      const generateHandler = className => {
        return function handleAnimationend() {
          this.classList.remove(className);
        };
      };

      usernameLabel.addEventListener('animationend', generateHandler('bad-username'), { once: true });
      takenUsernameItem.addEventListener('animationend', generateHandler('taken-username'), { once: true });

      usernameLabel.classList.add('bad-username');
      takenUsernameItem.classList.add('taken-username');

      break;
    }
  }
};

// works w/ CSS to maintain full-height on all devices
// (will run once on load and then on window-resize)
const setRealVH = () => {
  const realVH = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${realVH}px`);
};

// keeps correct area in view when virtual keyboard appears on mobile
// (will run on window-resize, which "detects" virtual-keyboard toggle)
const scrollToContentWrapperIfNeeded = () => {
  const activeEl = document.activeElement;
  if (activeEl.classList.contains('content-input')) {
    activeEl.parentNode.parentNode.scrollIntoView(false);
  }
};

// scrolls messages as needed on window-resize
// (default behavior is to scroll UP! we must override)
const messagesScroller = function(scrollData) {
  const { scrHgt, scrTop, cliHgt } = scrollData;
  const messages = this.messagesRef.current;

  const messagesWasScrolledDown = (scrHgt - scrTop <= cliHgt + 5);

  // scroll messages down if already was, else preserve scroll
  if (messagesWasScrolledDown) { 
    messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  } else {
    messages.scrollTop = messages.scrollHeight - (scrHgt - scrTop);
    // when message is ADDED, we instead use `messages.scrollTop = scrTop;`
    // (see MessagesWrapper.js)
  }
};

const setUpWindowListener = function() {
  window.addEventListener('resize', () => {
    const messages = this.messagesRef.current;
    const messagesScrollData = {
      scrHgt: messages.scrollHeight,
      scrTop: messages.scrollTop,
      cliHgt: messages.clientHeight
    };
    setRealVH();
    scrollToContentWrapperIfNeeded();
    const scrollMessages = messagesScroller.bind(this);
    scrollMessages(messagesScrollData);
  });
};

const defineOriginIfNeeded = () => {
  if (!window.location.origin) {
    window.location.origin =
      window.location.protocol
      + '//'
      + window.location.hostname
      + (window.location.port
        ? ':' + window.location.port
        : '');
  }
};

const setUpHerokuTimeoutMessage = function() {
  const herokuTimeoutAlert = () => {
    window.alert('You\'ve been disconnected from Mike\'s Chat App!\n'
    + '(Heroku does this after 55 seconds of server inactivity.)\n'
    + 'Please refresh the page to reconnect.');
  };

  if (window.location.hostname.includes('heroku')) {
    this.ws.onclose = () => {
      setTimeout(herokuTimeoutAlert, 1000); // so alert doesn't pop on manual close
    };
  }
};

export {
  menuToggler,
  menuOutIfIn,
  generateUsernameAndUsernamesSetter,
  generateMessageSetter,
  errorHandler,
  setRealVH,
  setUpWindowListener,
  defineOriginIfNeeded,
  setUpHerokuTimeoutMessage
};