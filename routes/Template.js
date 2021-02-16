const express = require('express');
const router = express.Router();
const { Template, validateTemplate } = require('../models/Template');
const { validateTemplateUpdate } = require('./RouteHelpers/Template');
const { validateObjectId } = require('./RouteHelpers/Common');

router.post('/', async (req, res) => {
  try {
    const { ...template } = req.body;

    const { error } = validateTemplate(template);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    let templateInDb = await Template.findOne({
      title: template.title,
    });
    if (templateInDb)
      return res.status(400).send({
        field: {
          name: 'title',
          message: 'A Template with this title already Exist',
        },
      });

    templateInDb = await new Template(template).save();
    res.status(200).send({
      field: {
        message: 'Successfully Added',
        data: templateInDb,
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

    const templateInDb = await Template.findByIdAndDelete(_id);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: templateInDb,
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
    const { ...template } = req.body;
    const { _id } = req.params;

    const { error } = validateTemplateUpdate(template);
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

    const templateInDb = await Template.updateOne({ _id: _id }, template);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: templateInDb,
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
        data: await Template.find(),
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
    const templatesInDb = await Template.find({ [property]: value });
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: templatesInDb,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
