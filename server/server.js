import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import compression from 'compression';

import { setUpWS } from './set-up-ws.js';

const app = express();
app.use(compression());
app.use(express.static('public'));

const httpServer = http.createServer(app);
httpServer.listen(process.env.PORT || 3000);

const wss = new WebSocket.Server({ 'server': httpServer });
setUpWS(wss, WebSocket);
