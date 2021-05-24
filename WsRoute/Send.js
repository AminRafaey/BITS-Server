const { MessageType, Mimetype } = require('@adiwajshing/baileys');
const { keywords } = require('../Static/Keyword');
const fs = require('fs');
const path = require('path');
const { Lead } = require('../models/Lead');
const { deleteFile } = require('../routes/Helper/FileHelper');

const { getCurrentUser } = require('./utility');

async function sendTextMessage(
  socket,
  connectedUsers,
  mobileNumbers,
  message,
  cb
) {
  const user =
    connectedUsers[
      connectedUsers.findIndex(
        (user) => user.mobileNumber === getCurrentUser(socket.id).room
      )
    ];

  for (number of mobileNumbers) {
    number = number.replace('+', '');

    const lead = await Lead.findOne({ phone: `+${number}` });

    let convertedMsg = message;
    lead &&
      keywords.map((k) => {
        convertedMsg = convertedMsg.replace(
          new RegExp(`__${k.title}__`, 'g'),
          lead[k.value]
        );
      });
    const exists = await user.conn.isOnWhatsApp(number);
    exists &&
      user.conn.sendMessage(
        `${number}@s.whatsapp.net`,
        convertedMsg,
        MessageType.text
      );
  }
  cb();
}

async function sendTextMessageOnGroup(
  socket,
  connectedUsers,
  groupId,
  message,
  cb
) {
  const user =
    connectedUsers[
      connectedUsers.findIndex(
        (user) => user.mobileNumber === getCurrentUser(socket.id).room
      )
    ];
  user.conn.sendMessage(groupId, message, MessageType.text);
  cb();
}

async function sendImage(
  socket,
  connectedUsers,
  mobileNumbers,
  message,
  mediaPath,
  cb
) {
  try {
    const user =
      connectedUsers[
        connectedUsers.findIndex(
          (user) => user.mobileNumber === getCurrentUser(socket.id).room
        )
      ];
    const buffer = fs.readFileSync(
      path.join(__dirname, '../public/media', mediaPath)
    );
    for (number of JSON.parse(mobileNumbers)) {
      number = number.replace('+', '');
      const lead = await Lead.findOne({ phone: `+${number}` });
      let convertedMsg = message;
      lead &&
        keywords.map((k) => {
          convertedMsg = convertedMsg.replace(
            new RegExp(`__${k.title}__`, 'g'),
            lead[k.value]
          );
        });
      const exists = await user.conn.isOnWhatsApp(number);
      exists &&
        user.conn.sendMessage(
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

async function sendVideo(
  socket,
  connectedUsers,
  mobileNumbers,
  message,
  mediaPath,
  cb
) {
  try {
    const user =
      connectedUsers[
        connectedUsers.findIndex(
          (user) => user.mobileNumber === getCurrentUser(socket.id).room
        )
      ];
    const buffer = fs.readFileSync(
      path.join(__dirname, '../public/media', mediaPath)
    );
    for (number of JSON.parse(mobileNumbers)) {
      number = number.replace('+', '');
      const lead = await Lead.findOne({ phone: `+${number}` });
      let convertedMsg = message;
      lead &&
        keywords.map((k) => {
          convertedMsg = convertedMsg.replace(
            new RegExp(`__${k.title}__`, 'g'),
            lead[k.value]
          );
        });
      const exists = await user.conn.isOnWhatsApp(number);
      exists &&
        user.conn.sendMessage(
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

async function sendPdf(
  socket,
  connectedUsers,
  mobileNumbers,
  message,
  mediaPath,
  cb
) {
  try {
    const user =
      connectedUsers[
        connectedUsers.findIndex(
          (user) => user.mobileNumber === getCurrentUser(socket.id).room
        )
      ];
    const buffer = fs.readFileSync(
      path.join(__dirname, '../public/media', mediaPath)
    );
    for (number of JSON.parse(mobileNumbers)) {
      number = number.replace('+', '');
      const lead = await Lead.findOne({ phone: `+${number}` });
      let convertedMsg = message;
      lead &&
        keywords.map((k) => {
          convertedMsg = convertedMsg.replace(
            new RegExp(`__${k.title}__`, 'g'),
            lead[k.value]
          );
        });
      const exists = await user.conn.isOnWhatsApp(number);
      exists &&
        user.conn.sendMessage(
          `${number}@s.whatsapp.net`,
          buffer,
          MessageType.document,
          { mimetype: Mimetype.pdf }
        );
      exists &&
        message &&
        user.conn.sendMessage(
          `${number}@s.whatsapp.net`,
          convertedMsg,
          MessageType.text
        );
    }
    cb();
    deleteFile(path.join(__dirname, '../public/media', mediaPath));
  } catch (err) {
    deleteFile(path.join(__dirname, '../public/media', mediaPath));
  }
}
module.exports = {
  sendTextMessage,
  sendTextMessageOnGroup,
  sendImage,
  sendVideo,
  sendPdf,
};
