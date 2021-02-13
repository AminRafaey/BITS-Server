const express = require('express');
const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const {
  writeCredentials,
  getCredentials,
} = require('./RouteHelpers/WAConnection');
const { renameFile, deleteFile } = require('./Helper/FileHelper');
const multer = require('multer');
const folderName = __dirname + '/../public/media';
const upload = multer({ dest: folderName });

router.get('/', async (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

  async function connectToWhatsApp() {
    const conn = new WAConnection();

    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;

    conn.on('qr', (qr) => {
      res.write(`data: ${JSON.stringify({ data: qr })}\n\n`);
    });

    conn.on('credentials-updated', () => {
      console.log(`credentials updated!`);
      writeCredentials(conn.base64EncodedAuthInfo());
      res.write(`data: ${JSON.stringify({ data: 'success' })}\n\n`);
    });

    await conn.connect();
    console.log('oh hello ' + conn.user.name + ' (' + conn.user.id + ')');
  }

  let credentials = await getCredentials();
  if (credentials) {
    res.write(`data: ${JSON.stringify({ data: 'Already Connected' })}\n\n`);
  } else {
    connectToWhatsApp().catch((err) => {
      console.log('unexpected error: ' + err);
      res.write(`data: ${JSON.stringify({ data: 'failure' })}\n\n`);
    });
  }

  req.on('close', () => {
    console.log(`Connection closed`);
  });
});

router.post('/', upload.array('file'), async (req, res) => {
  const { mobileNumbers, message } = req.body;
  console.log('here', mobileNumbers, message);

  async function connectToWhatsApp() {
    const conn = new WAConnection();

    conn.loadAuthInfo('./auth_info.json');
    conn.connectOptions.waitForChats = false;
    conn.connectOptions.waitOnlyForLastMessage = false;
    conn.connectOptions.maxIdleTimeMs = 2000;
    conn.connectOptions.maxRetries = 3;
    await conn.connect();

    conn.sendMessage(
      `${mobileNumbers}@s.whatsapp.net`,
      message,
      MessageType.text
    );
    res.send('success');
  }
  connectToWhatsApp().catch((err) => {
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/image', upload.array('file'), async (req, res) => {
  const { mobileNumbers, message } = req.body;
  async function connectToWhatsApp() {
    const conn = new WAConnection();

    conn.loadAuthInfo('./auth_info.json');
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

    conn.sendMessage(
      `${mobileNumbers}@s.whatsapp.net`,
      buffer,
      MessageType.image,
      { caption: message }
    );

    res.send('success');
  }
  renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
  connectToWhatsApp().catch((err) => {
    deleteFile(req.files);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/video', upload.array('file'), async (req, res) => {
  const { mobileNumbers, message } = req.body;
  async function connectToWhatsApp() {
    const conn = new WAConnection();

    conn.loadAuthInfo('./auth_info.json');
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

    conn.sendMessage(
      `${mobileNumbers}@s.whatsapp.net`,
      buffer,
      MessageType.video,
      { caption: message }
    );

    res.send('success');
  }
  renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
  connectToWhatsApp().catch((err) => {
    deleteFile(req.files);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

router.post('/pdf', upload.array('file'), async (req, res) => {
  const { mobileNumbers, message } = req.body;
  async function connectToWhatsApp() {
    const conn = new WAConnection();

    conn.loadAuthInfo('./auth_info.json');
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

    conn.sendMessage(
      `${mobileNumbers}@s.whatsapp.net`,
      buffer,
      MessageType.document,
      { mimetype: Mimetype.pdf }
    );
    conn.sendMessage(
      `${mobileNumbers}@s.whatsapp.net`,
      message,
      MessageType.text
    );
    res.send('success');
  }
  renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
  connectToWhatsApp().catch((err) => {
    deleteFile(req.files);
    res.send('failure');
    console.log('unexpected error: ' + err);
  });
});

module.exports = router;
