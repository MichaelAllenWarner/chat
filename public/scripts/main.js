const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

function setUpSubmitButton() {
  document.querySelector('#submit-button').addEventListener('click', () => {
    const outgoingMsgObj ={
      user: document.querySelector('#username').value || 'An anonymous user',
      time: Date.now(),
      text: document.querySelector('#message-input').value
    };
    if (outgoingMsgObj.text) {
      ws.send(JSON.stringify(outgoingMsgObj));
    }
    document.querySelector('#message-input').value = '';
  });
}

function setUpMessageInput() {
  document.querySelector('#message-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      document.querySelector('#submit-button').click();
    }
  });
}

function setUpMessageViewer () {
  ws.onmessage = (incomingMsgObj) => {
    const msgData = JSON.parse(incomingMsgObj.data);
    const user = msgData.user;
    const time = new Date(msgData.time);
    const text = msgData.text;
    const newMsg = document.createElement ('p');
    newMsg.textContent = `${user} said: ${text}`;
    newMsg.setAttribute('data-time', time);
    const ownUsername = document.querySelector('#username').value;
    const senderClass = (user === ownUsername) ? 'own-message' : 'other-message';
    newMsg.classList.add(senderClass);
    const messageViewer = document.querySelector('#message-viewer');
    messageViewer.appendChild(newMsg);
    console.log(incomingMsgObj);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setUpSubmitButton);
  document.addEventListener('DOMContentLoaded', setUpMessageInput);
  document.addEventListener('DOMContentLoaded', setUpMessageViewer);
} else {
  setUpSubmitButton();
  setUpMessageInput();
  setUpMessageViewer();
}
