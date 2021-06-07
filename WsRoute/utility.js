const users = [];

// Join user to chat
function userJoin(id, userName, room) {
  const user = { id, userName, room };

  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  console.log(users.find((user) => user.id === id));
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  console.log(users, room);
  return users.filter((user) => user.room === room);
}

function formatMessage(username, text) {
  return {
    username,
    text,
    time: new Date(),
  };
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  formatMessage,
};