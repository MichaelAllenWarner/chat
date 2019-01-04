const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

function setUpSubmitButton() {
  document.querySelector('#submit-button').addEventListener('click', () => {
    const outgoingMsg = document.querySelector('#message-input').value;
    if (outgoingMsg) {
      ws.send(outgoingMsg);
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
  ws.onmessage = (msg) => {
    const viewer = document.querySelector('#message-viewer');
    viewer.value = (viewer.value) ? `${viewer.value}\n${msg.data}` : msg.data;
    console.log(msg);
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
