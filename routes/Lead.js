const express = require('express');
const router = express.Router();
const { Lead, validateLead } = require('../models/Lead');

router.get('/:jid', async (req, res) => {
  try {
    const { jid } = req.params;
    console.log(jid);
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Lead.findOne({ jid: jid }).populate('labels'),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
