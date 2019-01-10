const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

function scrollPastAddressBar() {
  window.scrollTo(0, 1);
}

window.onload = scrollPastAddressBar;
