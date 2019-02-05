import { ids } from './ids';
import { ws } from './websocket/ws-connect';
import setUpWSSending from './websocket/ws-sending';
import setUpWSReceiving from './websocket/ws-receiving';
import setUpResponsiveLayout from './ui-ux/responsive-layout';
import setUpMenuToggle from './ui-ux/menu-toggle';
import setUpDarkModeToggle from './ui-ux/dark-mode-toggle';

// WebSocket
setUpWSSending(ids, ws);
setUpWSReceiving(ids, ws);

// UI/UX
setUpResponsiveLayout();
setUpMenuToggle();
setUpDarkModeToggle();

// because of Heroku 55-second timeout:
// ws.onclose = event => {
//   alert('Server idles after 1 minute of inactivity. Refresh page to reconnect.');
// }
