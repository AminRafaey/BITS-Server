const fs = require('fs');

function renameFile(file, newName) {
  const destPath = file.destination + '/' + newName;
  fs.rename(file.path, destPath, (err) => {
    if (err) console.log(newName + ' file rename failed');
    else console.log(newName + ' file renamed');
  });
}
function deleteFile(files) {
  files.forEach((file) => {
    fs.unlink(file.path, function (err) {
      if (!err) console.log('File deleted : ' + file.originalname);
    });
  });
}

exports.renameFile = renameFile;
exports.deleteFile = deleteFile;
