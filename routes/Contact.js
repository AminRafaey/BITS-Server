const express = require('express');
const router = express.Router();
const { Contact, validateContact } = require('../models/Contact');
const { validateContactUpdate } = require('./RouteHelpers/Contact');
const { validateObjectId } = require('./RouteHelpers/Common');

router.post('/', async (req, res) => {
  try {
    const { ...contact } = req.body;

    const { error } = validateContact(contact);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    let contactInDb = await Contact.findOne({
      mobileNumber: contact.mobileNumber,
    });
    if (contactInDb)
      return res.status(400).send({
        field: {
          name: 'Mobile Number',
          message: 'A Person with this mobile number already Exist',
        },
      });

    contactInDb = await new Contact(contact).save();
    res.status(200).send({
      field: {
        message: 'Successfully Added',
        data: contactInDb,
        name: 'successful',
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { error } = validateObjectId({ _id: _id });
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const contactInDb = await Contact.findByIdAndDelete(_id);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: contactInDb,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/:_id', async (req, res) => {
  try {
    const { ...contact } = req.body;
    const { _id } = req.params;

    const { error } = validateContactUpdate(contact);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    const { error: error2 } = validateObjectId({ _id: _id });
    if (error2)
      return res.status(400).send({
        field: {
          message: error2.details[0].message,
          name: error2.details[0].path[0],
        },
      });

    const contactInDb = await Contact.updateOne({ _id: _id }, contact);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: contactInDb,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/', async (req, res) => {
  try {
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Contact.find(),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/:property/:value', async (req, res) => {
  try {
    const { property, value } = req.params;
    const contactsInDb = await Contact.find({ [property]: value });
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: contactsInDb,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
