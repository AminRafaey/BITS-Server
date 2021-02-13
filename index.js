const express = require('express');
const config = require('config');
const app = express();

require('./startup/morgan')(app);
require('./startup/cors')(app);
require('./startup/db')(app);
require('./startup/routes')(app);

const port = process.env.PORT || config.get('port');
const server = app.listen(port, () =>
  console.log(`Listening on port ${port}...`)
);

process.on('uncaughtException', function (err, req, res, next) {
  console.log('Node Server startup Error');
});

module.exports = server;
