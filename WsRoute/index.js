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
    socket.on('get-qr', () => {
      async function connectToWhatsApp() {
        const conn = new WAConnection();
        conn.connectOptions.maxRetries = 1;

        conn.on('qr', (qr) => {
          io.to(socket.id).emit('get-qr', qr);
        });

        conn.on('chats-received', () => {
          if (!socket.personal.isChatsSent) {
            io.to(socket.id).emit('chats-received', conn.chats);
            socket.personal.isChatsSent = true;
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

        socket.on('send-text-message', async ({ mobileNumbers, message }) => {
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
            conn.sendMessage(
              `${number}@s.whatsapp.net`,
              convertedMsg,
              MessageType.text
            );
          }
        });

        socket.on(
          'send-image',
          async ({ mobileNumbers, message, mediaPath }) => {
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
                conn.sendMessage(
                  `${number}@s.whatsapp.net`,
                  buffer,
                  MessageType.image,
                  {
                    caption: convertedMsg,
                  }
                );
              }

              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            } catch (err) {
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            }
          }
        );

        socket.on(
          'send-video',
          async ({ mobileNumbers, message, mediaPath }) => {
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
                conn.sendMessage(
                  `${number}@s.whatsapp.net`,
                  buffer,
                  MessageType.video,
                  {
                    caption: convertedMsg,
                  }
                );
              }

              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            } catch (err) {
              deleteFile(path.join(__dirname, '../public/media', mediaPath));
            }
          }
        );

        socket.on('send-pdf', async ({ mobileNumbers, message, mediaPath }) => {
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
              conn.sendMessage(
                `${number}@s.whatsapp.net`,
                buffer,
                MessageType.document,
                { mimetype: Mimetype.pdf }
              );
              message &&
                conn.sendMessage(
                  `${number}@s.whatsapp.net`,
                  convertedMsg,
                  MessageType.text
                );
            }

            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          } catch (err) {
            console.log(err);
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          }
        });
        conn.on('close', ({ reason, isReconnecting }) =>
          console.log(
            'oh no got disconnected: ' +
              reason +
              ', reconnecting: ' +
              isReconnecting
          )
        );
      }
      connectToWhatsApp().catch((err) => {
        io.to(socket.id).emit('no-qr', null);
        console.log('unexpected error: ' + err);
      });
    });
  });
};
