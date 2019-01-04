function setUpWebSocket() {
  const HOST = location.origin.replace(/^http/, 'ws');
  const ws = new WebSocket(HOST);
  ws.onmessage = (msg) => {
    console.log('received message from server:');
    console.log(msg);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setUpWebSocket);
} else {
  setUpWebSocket();
}
