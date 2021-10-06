const express = require('express');
var path = require('path');
const Send = require('../routes/Send');
const Lead = require('../routes/Lead');
const Template = require('../routes/Template');
const Label = require('../routes/Label');
const Auth = require('../routes/Auth');
const Admin = require('../routes/Admin');
const Employee = require('../routes/Employee');

module.exports = function (app) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/api/send', Send);
  app.use('/api/lead', Lead);
  app.use('/api/template', Template);
  app.use('/api/label', Label);
  app.use('/api/auth', Auth);
  app.use('/api/admin', Admin);
  app.use('/api/employee', Employee);
};
