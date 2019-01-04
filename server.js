const express = require('express');
const http = require('http');
const SocketServer = require('ws').Server;

const app = express()
  .get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`)
  })
  .use(express.static('public'));

const httpServer = http.createServer(app);

const wss = new SocketServer({ 'server': httpServer });
wss.on('connection', (ws) => {
  console.log('client connected');
  ws.on('message', (msgFromSomeUser) => {
    console.log('received msg from client: ');
    console.log(msgFromSomeUser);
    wss.clients.forEach(client => {
      client.send(msgFromSomeUser);
    });
  });
  ws.on('close', () => {
    console.log('client disconnected');
  });
});

httpServer.listen(process.env.PORT || 3000);
