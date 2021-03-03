const express = require('express');
var path = require('path');
const WAConnection = require('../routes/WAConnection');
const Send = require('../routes/Send');
const Contact = require('../routes/Contact');
const Customer = require('../routes/Customer');
const Lead = require('../routes/Lead');
const Template = require('../routes/Template');
const Label = require('../routes/Label');
const Chat = require('../routes/Chat');

module.exports = function (app) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/connect', WAConnection);
  app.use('/send', Send);
  app.use('/contact', Contact);
  app.use('/customer', Customer);
  app.use('/lead', Lead);
  app.use('/template', Template);
  app.use('/label', Label);
  app.use('/Chat', Chat);
};
