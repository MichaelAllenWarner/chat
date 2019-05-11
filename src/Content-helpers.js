import React from 'react';

export const generateUsersSetter = receivedUsernames => {
  return function setUsernameAndUsernames(state) {
    let newUsername;
    const newUsernames = [];
    for (const [publicid, username] of receivedUsernames) {
      if (publicid === state.ids.publicid) {
        newUsername = username;
        newUsernames.unshift( // so own username is always listed first
          <li
            key={publicid}
            id='own-user'
            data-publicid={publicid}
            ref={this.userItemRefs[`${publicid}Ref`]}
          >
            {username ? `${username} (You)` : 'An anonymous user (You)'}
          </li>
        );
      } else {
        newUsernames.push(
          <li
            key={publicid}
            data-publicid={publicid}
            ref={this.userItemRefs[`${publicid}Ref`]}
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

export const generateMessagesSetter = msgData => {
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

export const errorHandler = function(msgData) {
  const errorType = msgData.errorType;
  const errorData = msgData.errorData;

  switch (errorType) {
    case 'badObject': {
      window.alert('Error: Stop trying to hack me!');
      break;
    }
    case 'takenUsername': { // IS THERE A MORE REACT-Y WAY TO DO THIS?
      const usernameLabel = this.usernameLabelRef.current;
      const takenUsernameItem = this.userItemRefs[`${errorData.publicidOfTakenUsername}Ref`].current;

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

export const defineOriginIfNeeded = () => {
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

export const herokuTimeoutAlert = () => {
  window.alert('You\'ve been disconnected from Mike\'s Chat App!\n'
  + '(Heroku does this after 55 seconds of server inactivity.)\n'
  + 'Please refresh the page to reconnect.');
};