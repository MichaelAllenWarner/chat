const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

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
  document.querySelector('#submit-button').addEventListener('click', () => {
    const outgoingMsgObj = {
      type: 'text',
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

function setUpWebSocketMsgReception () {
  ws.onmessage = (incomingMsgObj) => {
    const msgData = JSON.parse(incomingMsgObj.data);

    if (msgData.type = 'text') {
      processNewTextMsg(msgData);
    }

    function processNewTextMsg(msgData) {
      const viewer = document.querySelector('#message-viewer');
      const isScrolledDown = (viewer.scrollHeight - viewer.scrollTop <= viewer.clientHeight + 5);

      const user = msgData.user;
      const time = new Date(msgData.time);
      const text = msgData.text;

      const ownUsername = document.querySelector('#username').value;
      // FIXME: need foolproof way of distinguishing own message from other message
      const msgUserClass = (user === ownUsername) ? 'own-message' : 'other-message';

      const newMsg = document.createElement ('p');
      newMsg.textContent = `${user} said: ${text}`;
      newMsg.setAttribute('data-time', time);
      newMsg.classList.add(msgUserClass);
      viewer.appendChild(newMsg);

      // scroll down only if already nearly scrolled down
      if (isScrolledDown) {
        viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight; 
      }

      console.log(incomingMsgObj);
    }
  }
}
