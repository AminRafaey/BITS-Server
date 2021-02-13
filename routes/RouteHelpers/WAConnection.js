var fs = require('fs');

function getCredentials() {
  try {
    const file = fs.readFileSync('./auth_info.json');
    return JSON.parse(file);
  } catch {
    console.log('Previous session loading failed');
    return null;
  }
}

function writeCredentials(authInfo) {
  fs.writeFileSync('auth_info.json', JSON.stringify(authInfo, null, '\t'));
}

exports.getCredentials = getCredentials;
exports.writeCredentials = writeCredentials;
