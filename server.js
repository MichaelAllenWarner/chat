const express = require('express');
const http = require('http');
const SocketServer = require('ws').Server;

const port = process.env.PORT || 3000;
const app = express();
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`)
});
app.use(express.static('public'));
// app.listen(port);

const httpServer = http.createServer(app);

const wss = new SocketServer({ 'server': httpServer });
wss.on('connection', (ws) => {
  console.log('client connected');
  ws.send('msg to client: connection established on server');
  ws.on('close', () => {
    console.log('client disconnected');
  });
});

httpServer.listen(port);
