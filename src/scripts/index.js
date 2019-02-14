import setUpWSSending from './websocket/ws-sending';
import setUpWSReceiving from './websocket/ws-receiving';
import setUpResponsiveLayout from './ui-ux/responsive-layout';
import setUpMenuToggle from './ui-ux/menu-toggle';
import setUpDarkModeToggle from './ui-ux/dark-mode-toggle';

const ids = { publicid: undefined, privateid: undefined };

// for Internet Explorer
if (!window.location.origin) {
  window.location.origin =
    window.location.protocol
    + "//"
    + window.location.hostname
    + (window.location.port
      ? ':' + window.location.port
      : '');
}

const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

setUpWSSending(ids, ws);
setUpWSReceiving(ids, ws);

setUpResponsiveLayout();
setUpMenuToggle();
setUpDarkModeToggle();

// because of Heroku 55-second timeout:
// ws.onclose = event => {
//   alert('Server idles after 1 minute of inactivity. Refresh page to reconnect.');
// }
