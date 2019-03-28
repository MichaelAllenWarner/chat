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
const herokuTimeoutAlert = () => {
  alert('You\'ve been disconnected from Mike\'s Chat App!\n'
  + '(Heroku does this after 55 seconds of server inactivity.)\n'
  + 'Please refresh the page to reconnect.');
};

if (window.location.hostname.includes('heroku')) {
  ws.onclose = () => {
    setTimeout(herokuTimeoutAlert, 1000);    
  };
}

setUpWSSending(ids, ws);
setUpWSReceiving(ids, ws);

setUpResponsiveLayout();
setUpMenuToggle();
setUpDarkModeToggle();
