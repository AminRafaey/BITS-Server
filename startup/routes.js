const express = require('express');
var path = require('path');
const WAConnection = require('../routes/WAConnection');
const Contact = require('../routes/Contact');
const Template = require('../routes/Template');

module.exports = function (app) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.use('/connect', WAConnection);
  app.use('/contact', Contact);
  app.use('/template', Template);
};
