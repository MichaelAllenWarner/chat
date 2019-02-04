import { ids } from './ids';
import { ws } from './ws-connect';
import setUpWSSending from './ws-sending';
import setUpWSReceiving from './ws-receiving';
import setUpResponsiveLayout from './responsive-layout';
import setUpMenuToggle from './menu-toggle';
import setUpDarkModeToggle from './dark-mode-toggle';

// because of Heroku 55-second timeout:
// ws.onclose = event => {
//   alert('Server idles after 1 minute of inactivity. Refresh page to reconnect.');
// }

setUpWSSending(ids, ws);
setUpWSReceiving(ids, ws);
setUpResponsiveLayout();
setUpMenuToggle();
setUpDarkModeToggle();
