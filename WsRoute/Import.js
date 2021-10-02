const phone = require('phone');
const { Lead } = require('../models/Lead');
const { getCurrentUser } = require('./utility');

async function importContactsFromWhatsApp(
  adminId,
  socket,
  connectedUsers,
  cb,
  io,
  tryNo = 0
) {
  const user =
    connectedUsers[
      connectedUsers.findIndex(
        (user) => user.mobileNumber === getCurrentUser(socket.id).room
      )
    ];

  if (!user || !user.contacts) {
    tryNo > 180
      ? cb({
          status: 'error',
          message: `Its taking too much time, please try again later`,
        })
      : setTimeout(
          () =>
            importContactsFromWhatsApp(
              adminId,
              socket,
              connectedUsers,
              cb,
              io,
              (tryNo = tryNo + 1)
            ),
          1000
        );
    return;
  }
  io.to(socket.id).emit('import-start', {
    message:
      'Import start successfully, total contacts are ' + user.contacts.length,
  });
  user.import = {};
  user.import = {
    ...user.import,
    latestImportTime: new Date(),
    status: 'In Progress',
  };
  user.import = { ...user.import, totalContacts: user.contacts.length };
  let count = 0;
  for (contact of user.contacts) {
    const mobileNumber = '+' + contact.jid.split('@')[0];
    if (phone(mobileNumber).length !== 0) {
      if (
        await Lead.findOne({
          phone: mobileNumber,
          adminId: adminId,
        })
      ) {
        continue;
      }

      if (contact.name && contact.short) {
        count++;
        await new Lead({
          firstName: contact.short,
          lastName: contact.name.replace(contact.short, ''),
          adminId,
          phone: mobileNumber,
        }).save();
        continue;
      }
      count++;
      await new Lead({
        ...(contact.name
          ? { firstName: contact.name }
          : { firstName: 'Anonymous' }),
        adminId,
        phone: mobileNumber,
      }).save();
    }
    user.import = { ...user.import, savedContacts: count, status: 'complete' };
  }
  cb({
    status: 'success',
    message: `Total ${count} new contact imported successfully`,
    data: await Lead.find({ adminId: adminId }).skip(0).limit(150),
  });
}

async function getImportContactStatus(socket, connectedUsers, cb, tryNo = 0) {
  const user =
    connectedUsers[
      connectedUsers.findIndex(
        (user) => user.mobileNumber === getCurrentUser(socket.id).room
      )
    ];

  if (user) {
    cb({
      status: 'success',
      message: ``,
      data: user.import,
    });
  }
}

module.exports = {
  importContactsFromWhatsApp,
  getImportContactStatus,
};
