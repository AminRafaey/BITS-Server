const express = require('express');
var path = require('path');
const WAConnection = require('../routes/WAConnection');
const Customer = require('../routes/Customer');
const Lead = require('../routes/Lead');
const Template = require('../routes/Template');
const Label = require('../routes/Label');

module.exports = function (app) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/connect', WAConnection);
  app.use('/customer', Customer);
  app.use('/lead', Lead);
  app.use('/template', Template);
  app.use('/label', Label);
};
