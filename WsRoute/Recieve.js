const { WA_MESSAGE_STUB_TYPES } = require('@adiwajshing/baileys');

function recieveMessage(chat) {
  if (chat.presences) {
    // receive presence updates -- composing, available, etc.
    Object.values(chat.presences).forEach((presence) =>
      console.log(
        `${presence.name}'s presence is ${presence.lastKnownPresence} in ${chat.jid}`
      )
    );
  }

  if (chat.imgUrl) {
    console.log('imgUrl of chat changed ', chat.imgUrl);
    return;
  }

  // only do something when a new message is received
  if (!chat.hasNewMessage) {
    if (chat.messages) {
      console.log('updated message: ', chat.messages.first);
    }
    return;
  }

  const m = chat.messages.all()[0]; // pull the new message from the update
  const messageStubType = WA_MESSAGE_STUB_TYPES[m.messageStubType] || 'MESSAGE';
  console.log('got notification of type: ' + messageStubType);

  const messageContent = m.message;
  // if it is not a regular text or media message
  if (!messageContent) return;

  if (m.key.fromMe) {
    console.log('From me');
  }
  //Doing this because when i sent simple text through baileys it get converted into extended
  //May be WA is working still fine because in case of extended when text is too small it get ignored

  if (
    m.message.extendedTextMessage &&
    !m.message.extendedTextMessage.contextInfo
  ) {
    m['message']['conversation'] = m['message']['extendedTextMessage']['text'];
    delete m['message']['extendedTextMessage'];
  }
  return m;
  //  let sender = m.key.remoteJid;
  //   if (m.key.participant) {
  //     // participant exists if the message is in a group
  //     sender += ' (' + m.key.participant + ')';
  //   } else {
  //     m.key.remoteJid.split('@')[1] === 's.whatsapp.net' &&
  //       io.to(socket.id).emit('new-message', m);
  //   }
}

module.exports = {
  recieveMessage,
};
