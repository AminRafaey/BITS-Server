const express = require('express');
const path = require('path');
const router = express.Router();
const { renameFile, deleteFile } = require('./Helper/FileHelper');
const multer = require('multer');
const folderName = __dirname + '/../public/media';
const upload = multer({ dest: folderName });

router.post('/', upload.array('file'), async (req, res) => {
  try {
    renameFile(req.files[0], 'new' + path.extname(req.files[0].originalname));
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Saved',
        data: `/new${path.extname(req.files[0].originalname)}`,
      },
    });
  } catch (err) {
    console.log(err);
    deleteFile(
      req.files[0].destination +
        '/new' +
        path.extname(req.files[0].originalname)
    );
    deleteFile(req.files[0].path);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
