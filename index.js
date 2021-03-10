const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const config = require('config');
const app = express();

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

require('./startup/morgan')(app);
require('./startup/cors')(app);
require('./startup/db')(app);
require('./startup/routes')(app);
require('./WsRoute/index')(io);

// Run when client connects

const port = process.env.PORT || config.get('port');
server.listen(port, () => console.log(`Listening on port ${port}...`));

process.on('uncaughtException', function (err, req, res, next) {
  console.log('Node Server startup Error');
});

module.exports = server;
