const express = require('express');
const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const { Customer } = require('../models/Customer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { renameFile, deleteFile } = require('./Helper/FileHelper');
const multer = require('multer');
const folderName = __dirname + '/../public/media';
const upload = multer({ dest: folderName });

router.post('/', async (req, res) => {
  const { mobileNumbers, message } = req.body;

  async function connectToWhatsApp() {
    const conn = new WAConnection();
    const customer = await Customer.findOne({ name: 'Amin' });
    const credentials = {
      clientID: customer.clientID,
      serverToken: customer.serverToken,
      clientToken: customer.clientToken,
      encKey: customer.encKey,
      macKey: customer.macKey,
    };
    conn.loadAuthInfo(credentials);
    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;
    await conn.connect();

    mobileNumbers.map((number) =>
      conn.sendMessage(`${number}@s.whatsapp.net`, message, MessageType.text)
    );

    res.send('success');
  }
  connectToWhatsApp().catch((err) => {
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/image', upload.array('file'), async (req, res) => {
  const { message } = req.body;
  const mobileNumbers = JSON.parse(req.body.mobileNumbers);
  async function connectToWhatsApp() {
    renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
    const conn = new WAConnection();

    const customer = await Customer.findOne({ name: 'Amin' });
    const credentials = {
      clientID: customer.clientID,
      serverToken: customer.serverToken,
      clientToken: customer.clientToken,
      encKey: customer.encKey,
      macKey: customer.macKey,
    };
    conn.loadAuthInfo(credentials);
    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;
    await conn.connect();

    const buffer = fs.readFileSync(
      `${req.files[0].destination}/new${path.extname(
        req.files[0].originalname
      )}`
    );
    mobileNumbers.map((number) =>
      conn.sendMessage(`${number}@s.whatsapp.net`, buffer, MessageType.image, {
        caption: message,
      })
    );
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    res.send('success');
  }

  connectToWhatsApp().catch((err) => {
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    deleteFile(req.files[0].path);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/video', upload.array('file'), async (req, res) => {
  const { message } = req.body;
  const mobileNumbers = JSON.parse(req.body.mobileNumbers);
  async function connectToWhatsApp() {
    renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
    const conn = new WAConnection();

    const customer = await Customer.findOne({ name: 'Amin' });
    const credentials = {
      clientID: customer.clientID,
      serverToken: customer.serverToken,
      clientToken: customer.clientToken,
      encKey: customer.encKey,
      macKey: customer.macKey,
    };
    conn.loadAuthInfo(credentials);
    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;
    await conn.connect();

    const buffer = fs.readFileSync(
      `${req.files[0].destination}/new${path.extname(
        req.files[0].originalname
      )}`
    );
    mobileNumbers.map((number) =>
      conn.sendMessage(`${number}@s.whatsapp.net`, buffer, MessageType.video, {
        caption: message,
      })
    );
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    res.send('success');
  }
  renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
  connectToWhatsApp().catch((err) => {
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    deleteFile(req.files[0].path);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/pdf', upload.array('file'), async (req, res) => {
  const { message } = req.body;
  const mobileNumbers = JSON.parse(req.body.mobileNumbers);
  async function connectToWhatsApp() {
    renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
    const conn = new WAConnection();

    const customer = await Customer.findOne({ name: 'Amin' });
    const credentials = {
      clientID: customer.clientID,
      serverToken: customer.serverToken,
      clientToken: customer.clientToken,
      encKey: customer.encKey,
      macKey: customer.macKey,
    };
    conn.loadAuthInfo(credentials);
    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;
    await conn.connect();

    const buffer = fs.readFileSync(
      `${req.files[0].destination}/new${path.extname(
        req.files[0].originalname
      )}`
    );
    mobileNumbers.map((number) =>
      conn.sendMessage(
        `${number}@s.whatsapp.net`,
        buffer,
        MessageType.document,
        { mimetype: Mimetype.pdf }
      )
    );
    message &&
      mobileNumbers.map((number) =>
        conn.sendMessage(`${number}@s.whatsapp.net`, message, MessageType.text)
      );
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    res.send('success');
  }
  renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
  connectToWhatsApp().catch((err) => {
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    deleteFile(req.files[0].path);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

module.exports = router;
