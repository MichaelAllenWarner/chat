export default function setUpWSReceiving(ids, ws) {
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
  };

  function handleError(errorType, errorData) {
    switch (errorType) {
      case 'badObject':
        alert('Error: Stop trying to hack me!');
        break;
      case 'takenUsername': {
        const usernameLabel = document.querySelector('#username-label');

        const usernameItemsArr = Array.from(document.querySelectorAll('#usernames-list li'));
        const takenUsernameItem = usernameItemsArr.find(usernameItem =>
          usernameItem.getAttribute('data-publicid') === errorData.publicidOfTakenUsername);

        const removeClass = className => {
          return function() {
            this.classList.remove(className);
          };
        };

        usernameLabel.addEventListener('animationend', removeClass('bad-username'), { once: true });
        takenUsernameItem.addEventListener('animationend', removeClass('taken-username'), { once: true });

        usernameLabel.classList.add('bad-username');
        takenUsernameItem.classList.add('taken-username');

        break;
      }
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
    const displayedUsername = username || 'An anonymous user';
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
}
