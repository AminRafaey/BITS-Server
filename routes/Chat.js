const express = require('express');
const { WAConnection } = require('@adiwajshing/baileys');
const { Customer } = require('../models/Customer');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(userId);
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  res.writeHead(200, headers);

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
    conn.connectOptions.maxIdleTimeMs = 15000;
    conn.connectOptions.maxRetries = 3;

    const messages = await conn.loadMessages(userId, 25);
    console.log(messages);
    // res.write(
    //     `data: ${JSON.stringify({ data:messages })}\n\n`
    //   );
    // res.write(`data: ${JSON.stringify({ data: 'success' })}\n\n`);

    await conn.connect();
  }

  connectToWhatsApp().catch((err) => {
    res.send('failure');
    console.log('unexpected error: ' + err);
  });

  req.on('close', () => {
    console.log(`Connection closed`);
  });
});

module.exports = router;
