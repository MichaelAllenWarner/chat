const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const setUpWS = require('./set-up-ws.js');

const app = express();
app.use(express.static('public'));

const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 3000);

const wss = new WebSocket.Server({ 'server': httpServer });
setUpWS(wss, WebSocket);
