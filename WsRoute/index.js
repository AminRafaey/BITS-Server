const { WAConnection } = require('@adiwajshing/baileys');
const {
  sendTextMessage,
  sendTextMessageOnGroup,
  sendImage,
  sendVideo,
  sendPdf,
} = require('./Send');
const {
  importContactsFromWhatsApp,
  getImportContactStatus,
} = require('./Import');

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  formatMessage,
} = require('./utility');
const { recieveMessage } = require('./Recieve');
const connectedUsers = [];
module.exports = function (io) {
  io.on('connection', (socket) => {
    socket.personal = {};
    socket.personal.isChatsSent = false;
    socket.personal.isContactsSent = false;
    socket.on('get-qr', ({currentConnRef, adminMobileNumber}) => {
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
          if('+' + conn.user.jid.split('@')[0] === adminMobileNumber){if (!socket.personal.isChatsSent) {
            io.to(socket.id).emit('chats-received', conn.chats);
            const mobileNumber = '+' + conn.user.jid.split('@')[0];
            const index = connectedUsers.findIndex(
              (user) => user.mobileNumber === mobileNumber
            );

            if (index === -1) {
              connectedUsers.push({
                ...conn.user,
                mobileNumber: mobileNumber,
                connectedAt: new Date(),
                chats: conn.chats,
                currentConnRef: currentConnRef,
                conn: conn,
              });
            } else {
              connectedUsers[index] = {
                ...connectedUsers[index],
                chats: conn.chats,
                conn: conn,
              };
            }
            socket.personal.isChatsSent = true;
          } else {
            io.to(socket.id).emit('chats-received', []);
          }}
        });

        conn.on('contacts-received', () => {
          let arr = [];
          Object.keys(conn.contacts).map((jid) => arr.push(conn.contacts[jid]));
          const mobileNumber = '+' + conn.user.jid.split('@')[0];
          const index = connectedUsers.findIndex(
            (user) => user.mobileNumber === mobileNumber
          );

          if (index === -1) {
            connectedUsers.push({
              ...conn.user,
              mobileNumber: mobileNumber,
              connectedAt: new Date(),
              contacts: arr,
              currentConnRef: currentConnRef,
              conn: conn,
            });
          } else {
            connectedUsers[index] = {
              ...connectedUsers[index],
              contacts: arr,
              conn: conn,
            };
          }
        });

        conn.on('open', async () => {
          if('+' + conn.user.jid.split('@')[0] !== adminMobileNumber){
            io.to(socket.id).emit('wrong-mobile-number', {
              currentConnRef: currentConnRef,
            });
            return;
          }
          // await Customer.updateOne({
          //   name: 'Amin',
          //   ...conn.base64EncodedAuthInfo(),
          // });
          const mobileNumber = '+' + conn.user.jid.split('@')[0];

          const index = connectedUsers.findIndex(
            (user) => user.mobileNumber === mobileNumber
          );
          if (index === -1) {
            connectedUsers.push({
              ...conn.user,
              mobileNumber,
              connectedAt: new Date(),
              currentConnRef: currentConnRef,
              conn: conn,
            });
          }
          io.to(socket.id).emit('connection-status', {
            status: 'success',
            currentConnRef: currentConnRef,
          });
        });

        await conn.connect();

        console.log('+' + conn.user.jid.split('@')[0], adminMobileNumber);
        

        conn.on('chat-new', (chat) => {
          io.to(socket.id).emit('chat-new', chat);
        });

        conn.on('chat-update', async (chat) => {
          const message = recieveMessage(chat);
          message &&
            io
              .to('+' + conn.user.jid.split('@')[0])
              .emit('new-message', message);
        });

        socket.on('get-contact-messages', async (jid) => {
          const messages = await conn.loadMessages(jid, 100);
          io.to(socket.id).emit('get-contact-messages', { messages, jid: jid });
        });

        conn.on('close', ({ reason, isReconnecting }) => {
          console.log(conn.user.name + ' is disconnected from Whatsapp');

          const index = connectedUsers.findIndex(
            (user) => user.mobileNumber === '+' + conn.user.jid.split('@')[0]
          );

          if (index !== -1) {
            console.log('+' + conn.user.jid.split('@')[0]);
            io.to('+' + conn.user.jid.split('@')[0]).emit('disconnected', {
              message: 'Disconnected from WhatsApp: ' + reason,
              currentConnRef: currentConnRef,
            });
            connectedUsers.splice(index, 1);
          }
        });
      }
      connectToWhatsApp().catch((err) => {
        const error = new Error(err);
        console.log(error);
        if (!error.toString().includes('Too Many Requests')) {
          io.to(socket.id).emit('no-qr', null);

          const index = connectedUsers.findIndex(
            (user) => user.mobileNumber === getCurrentUser(socket.id).room
          );

          if (index !== -1) {
            io.to('+' + conn.user.jid.split('@')[0]).emit('disconnected', {
              message: 'Disconnected from WhatsApp: ' + err,
              currentConnRef: currentConnRef,
            });
            connectedUsers.splice(index, 1);
          }
        }
      });
    });

    socket.on(
      'send-text-message',
      async ({ mobileNumbers, message }, arg2, cb) => {
        sendTextMessage(socket, connectedUsers, mobileNumbers, message, cb);
      }
    );

    socket.on(
      'send-text-message-on-group',
      async ({ groupId, message }, arg2, cb) => {
        sendTextMessageOnGroup(socket, connectedUsers, groupId, message, cb);
      }
    );

    socket.on(
      'send-image',
      async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
        sendImage(
          socket,
          connectedUsers,
          mobileNumbers,
          message,
          mediaPath,
          cb
        );
      }
    );

    socket.on(
      'send-video',
      async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
        sendVideo(
          socket,
          connectedUsers,
          mobileNumbers,
          message,
          mediaPath,
          cb
        );
      }
    );

    socket.on(
      'send-pdf',
      async ({ mobileNumbers, message, mediaPath }, arg2, cb) => {
        sendPdf(socket, connectedUsers, mobileNumbers, message, mediaPath, cb);
      }
    );

    socket.on(
      'import-contacts-from-whatsApp',
      async ({ adminId }, arg2, cb) => {
        importContactsFromWhatsApp(adminId, socket, connectedUsers, cb, io);
      }
    );

    socket.on('get-Import-Contacts-Status', async ({}, arg2, cb) => {
      getImportContactStatus(socket, connectedUsers, cb);
    });

    socket.on('join-room', ({ userName, mobileNumber }, arg2, cb) => {
      const user = userJoin(socket.id, userName, mobileNumber);

      socket.join(user.room);

      const index = connectedUsers.findIndex(
        (user) => user.mobileNumber === mobileNumber
      );
      if (index !== -1) {
        io.to(socket.id).emit('connection-status', {
          status: 'success',
          currentConnRef: connectedUsers[index]['currentConnRef'],
        });
        io.to(socket.id).emit('chats-received', connectedUsers[index].chats);
      }

      // Broadcast when a user connects
      io.to(user.room).emit(
        'room-updates',
        formatMessage('BITS', `${user.userName} has joined`)
      );

      io.to(user.room).emit('room-users', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
      cb();
    });

    socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
        socket.broadcast
          .to(user.room)
          .emit(
            'room-updates',
            formatMessage('BITS', `${user.userName} has left`)
          );

        // Send users and room info
        socket.broadcast.to(user.room).emit('room-users', {
          room: user.room,
          users: getRoomUsers(user.room).filter((u) => u.id !== socket.id),
        });
      }
    });
  });
};
