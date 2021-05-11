const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const { keywords } = require('../Static/Keyword');
const fs = require('fs');
const path = require('path');
const { Customer } = require('../models/Customer');
const { Lead } = require('../models/Lead');
const { deleteFile } = require('../routes/Helper/FileHelper');

module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.personal = {};
    socket.personal.isChatsSent = false;
    socket.personal.isContactsSent = false;
    socket.on('get-qr', (currentConnRef) => {
      async function connectToWhatsApp() {
        const conn = new WAConnection();

        conn.connectOptions.maxRetries = 1;

        conn.on('qr', (qr) => {
          io.to(socket.id).emit('get-qr', {
            qr: qr,
            currentConnRef: currentConnRef,
          });
        });

        conn.on('chats-received', () => {
          if (!socket.personal.isChatsSent) {
            io.to(socket.id).emit('chats-received', conn.chats);
            socket.personal.isChatsSent = true;
          } else {
            io.to(socket.id).emit('chats-received', []);
          }
        });

        conn.on('contacts-received', () => {
          if (!socket.personal.isContactsSent) {
            let arr = [];
            Object.keys(conn.contacts).map((jid) =>
              arr.push(conn.contacts[jid])
            );
            io.to(socket.id).emit('contacts-received', arr);
            socket.personal.isContactsSent = true;
          }
        });

        conn.on('credentials-updated', async () => {
          await Customer.updateOne({
            name: 'Amin',
            ...conn.base64EncodedAuthInfo(),
          });
          io.to(socket.id).emit('connection-status', 'success');
        });

        await conn.connect();

        socket.on('get-contact-messages', async (jid) => {
          const messages = await conn.loadMessages(jid, 100);
          io.to(socket.id).emit('get-contact-messages', { messages, jid: jid });
        });

        socket.on(
          'send-text-message',
          async ({ mobileNumbers, message }, arg2, cb) => {
            for (number of mobileNumbers) {
              const lead = await Lead.findOne({ phone: `+${number}` });
              let convertedMsg = message;
              lead &&
                keywords.map((k) => {
                  convertedMsg = convertedMsg.replace(
                    new RegExp(`__${k.title}__`, 'g'),
                    lead[k.value]
                  );
                });
              const exists = await conn.isOnWhatsApp(number);
              exists &&
                conn.sendMessage(
                  `${number}@s.whatsapp.net`,
                  convertedMsg,
                  MessageType.text
                );
            }
            cb();
          }
        );

        socket.on(
          'send-image',
          async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
            try {
              const buffer = fs.readFileSync(
                path.join(__dirname, '../public/media', mediaPath)
              );
              for (number of JSON.parse(mobileNumbers)) {
                const lead = await Lead.findOne({ phone: `+${number}` });
                let convertedMsg = message;
                lead &&
                  keywords.map((k) => {
                    convertedMsg = convertedMsg.replace(
                      new RegExp(`__${k.title}__`, 'g'),
                      lead[k.value]
                    );
                  });
                const exists = await conn.isOnWhatsApp(number);
                exists &&
                  conn.sendMessage(
                    `${number}@s.whatsapp.net`,
                    buffer,
                    MessageType.image,
                    {
                      caption: convertedMsg,
                    }
                  );
              }
              cb();
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            } catch (err) {
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            }
          }
        );

        socket.on(
          'send-video',
          async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
            try {
              const buffer = fs.readFileSync(
                path.join(__dirname, '../public/media', mediaPath)
              );
              for (number of JSON.parse(mobileNumbers)) {
                const lead = await Lead.findOne({ phone: `+${number}` });
                let convertedMsg = message;
                lead &&
                  keywords.map((k) => {
                    convertedMsg = convertedMsg.replace(
                      new RegExp(`__${k.title}__`, 'g'),
                      lead[k.value]
                    );
                  });
                const exists = await conn.isOnWhatsApp(number);
                exists &&
                  conn.sendMessage(
                    `${number}@s.whatsapp.net`,
                    buffer,
                    MessageType.video,
                    {
                      caption: convertedMsg,
                    }
                  );
              }
              cb();
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            } catch (err) {
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            }
          }
        );

        socket.on(
          'send-pdf',
          async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
            try {
              const buffer = fs.readFileSync(
                path.join(__dirname, '../public/media', mediaPath)
              );
              for (number of JSON.parse(mobileNumbers)) {
                const lead = await Lead.findOne({ phone: `+${number}` });
                let convertedMsg = message;
                lead &&
                  keywords.map((k) => {
                    convertedMsg = convertedMsg.replace(
                      new RegExp(`__${k.title}__`, 'g'),
                      lead[k.value]
                    );
                  });
                const exists = await conn.isOnWhatsApp(number);
                exists &&
                  conn.sendMessage(
                    `${number}@s.whatsapp.net`,
                    buffer,
                    MessageType.document,
                    { mimetype: Mimetype.pdf }
                  );
                exists &&
                  message &&
                  conn.sendMessage(
                    `${number}@s.whatsapp.net`,
                    convertedMsg,
                    MessageType.text
                  );
              }
              cb();
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            } catch (err) {
              console.log(err);
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            }
          }
        );
        conn.on('close', ({ reason, isReconnecting }) => {
          console.log('here', reason);
          io.to(socket.id).emit('disconnected', {
            message: 'Disconnected from WhatsApp: ' + reason,
            currentConnRef: currentConnRef,
          });
        });
      }
      connectToWhatsApp().catch((err) => {
        io.to(socket.id).emit('no-qr', null);
        console.log('unexpected error: ' + err);
      });
    });
  });
};
