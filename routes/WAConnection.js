const express = require('express');
const { WAConnection } = require('@adiwajshing/baileys');
const router = express.Router();

const { Customer } = require('../models/Customer');

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

    conn.on('credentials-updated', async () => {
      await Customer.updateOne({
        name: 'Amin',
        ...conn.base64EncodedAuthInfo(),
      });
      res.write(`data: ${JSON.stringify({ data: 'success' })}\n\n`);
    });

    await conn.connect();
  }

  const customer = await Customer.findOne({ name: 'Amin' });
  if (
    customer.clientID &&
    customer.serverToken &&
    customer.clientToken &&
    customer.encKey &&
    customer.macKey
  ) {
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
module.exports = router;
