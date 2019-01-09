const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);
