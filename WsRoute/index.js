const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');
const { Customer } = require('../models/Customer');
const { deleteFile } = require('../routes/Helper/FileHelper');

module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.personal = {};
    socket.personal.isChatsSent = false;
    socket.personal.isContactsSent = false;
    socket.on('get-qr', () => {
      async function connectToWhatsApp() {
        const conn = new WAConnection();

        conn.connectOptions.maxRetries = 5;

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

        socket.on('send-text-message', ({ mobileNumbers, message }) => {
          console.log(mobileNumbers, message);
          mobileNumbers.map((number) =>
            conn.sendMessage(
              `${number}@s.whatsapp.net`,
              message,
              MessageType.text
            )
          );
        });

        socket.on('send-image', ({ mobileNumbers, message, mediaPath }) => {
          try {
            const buffer = fs.readFileSync(
              path.join(__dirname, '../public/media', mediaPath)
            );
            JSON.parse(mobileNumbers).map((number) =>
              conn.sendMessage(
                `${number}@s.whatsapp.net`,
                buffer,
                MessageType.image,
                {
                  caption: message,
                }
              )
            );
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          } catch (err) {
            console.log(err);
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          }
        });

        socket.on('send-video', ({ mobileNumbers, message, mediaPath }) => {
          try {
            const buffer = fs.readFileSync(
              path.join(__dirname, '../public/media', mediaPath)
            );
            JSON.parse(mobileNumbers).map((number) =>
              conn.sendMessage(
                `${number}@s.whatsapp.net`,
                buffer,
                MessageType.video,
                {
                  caption: message,
                }
              )
            );
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          } catch (err) {
            console.log(err);
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          }
        });

        socket.on('send-pdf', ({ mobileNumbers, message, mediaPath }) => {
          try {
            const buffer = fs.readFileSync(
              path.join(__dirname, '../public/media', mediaPath)
            );
            JSON.parse(mobileNumbers).map((number) =>
              conn.sendMessage(
                `${number}@s.whatsapp.net`,
                buffer,
                MessageType.document,
                { mimetype: Mimetype.pdf }
              )
            );
            message &&
              mobileNumbers.map((number) =>
                conn.sendMessage(
                  `${number}@s.whatsapp.net`,
                  message,
                  MessageType.text
                )
              );
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          } catch (err) {
            console.log(err);
            deleteFile(path.join(__dirname, '../public/media', mediaPath));
          }
        });
      }
      connectToWhatsApp().catch((err) => {
        io.to(socket.id).emit('no-qr', null);
        console.log('unexpected error: ' + err);
      });
    });
  });
};
