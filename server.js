const express = require('express');
const SocketServer = require('ws').Server;

const server = express();
server.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
});
server.use(express.static('public'));
server.listen(process.env.PORT || 3000);
console.log(server);

const wss = new SocketServer({ server });
wss.on('connection', (ws) => {
  console.log('client connected');
  ws.send('msg to client: connection established on server');
  ws.on('close', () => {
    console.log('client disconnected');
  });
});
