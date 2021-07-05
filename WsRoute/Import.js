const phone = require('phone');

const { Lead } = require('../models/Lead');

const { getCurrentUser } = require('./utility');

async function importContactsFromWhatsApp(adminId, socket, connectedUsers, cb) {
  const user =
    connectedUsers[
      connectedUsers.findIndex(
        (user) => user.mobileNumber === getCurrentUser(socket.id).room
      )
    ];
  if (!user) {
    setTimeout(
      () => importContactsFromWhatsApp(adminId, socket, connectedUsers, cb),
      1000
    );
    return;
  }
  let count = 0;
  for (contact of user.contacts) {
    const mobileNumber = '+' + contact.jid.split('@')[0];
    if (phone(mobileNumber).length !== 0) {
      if (
        (await Lead.findOne({
          phone: mobileNumber,
          adminId: adminId,
        })) ||
        !contact.name
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
        firstName: contact.name,
        adminId,
        phone: mobileNumber,
      }).save();
    }
  }
  cb({
    status: 'success',
    message: `Total ${count} new contact imported successfully`,
    data: await Lead.find({ adminId: adminId }),
  });
}

module.exports = {
  importContactsFromWhatsApp,
};
