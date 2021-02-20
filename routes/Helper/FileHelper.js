const fs = require('fs');

function renameFile(file, newName) {
  try {
    const destPath = file.destination + '/' + newName;
    fs.renameSync(file.path, destPath);
  } catch (err) {
    console.log(newName + ' file rename failed');
  }
}
function deleteFile(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err + ' file delete failed');
  }
}

exports.renameFile = renameFile;
exports.deleteFile = deleteFile;
