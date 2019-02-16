import setUpWSSending from './websocket/ws-sending';
import setUpWSReceiving from './websocket/ws-receiving';
import setUpResponsiveLayout from './ui-ux/responsive-layout';
import setUpMenuToggle from './ui-ux/menu-toggle';
import setUpDarkModeToggle from './ui-ux/dark-mode-toggle';

// for Internet Explorer
if (!window.location.origin) {
  window.location.origin =
    window.location.protocol
    + '//'
    + window.location.hostname
    + (window.location.port
      ? ':' + window.location.port
      : '');
}

const ids = { publicid: undefined, privateid: undefined };

const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

// because of Heroku 55-second timeout:
if (window.location.hostname.includes('heroku')) {
  ws.onclose = () => {
    alert('You\'ve been disconnected.\n'
     + 'This is probably because Heroku (the hosting service) makes the server idle after 1 minute of inactivity.\n'
     + 'Please refresh the page to reconnect.');
  };
}

setUpWSSending(ids, ws);
setUpWSReceiving(ids, ws);

setUpResponsiveLayout();
setUpMenuToggle();
setUpDarkModeToggle();
