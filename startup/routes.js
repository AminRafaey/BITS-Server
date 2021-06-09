const express = require('express');
var path = require('path');
const Send = require('../routes/Send');
const Customer = require('../routes/Customer');
const Lead = require('../routes/Lead');
const Template = require('../routes/Template');
const Label = require('../routes/Label');
const Auth = require('../routes/Auth');
const Admin = require('../routes/Admin');
const Employee = require('../routes/Employee');

module.exports = function (app) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/send', Send);
  app.use('/customer', Customer);
  app.use('/lead', Lead);
  app.use('/template', Template);
  app.use('/label', Label);
  app.use('/auth', Auth);
  app.use('/admin', Admin);
  app.use('/employee', Employee);
};
