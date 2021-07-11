const express = require('express');
const router = express.Router();
const stream = require('stream');
const xlsx = require('node-xlsx');
const { Template, validateTemplate } = require('../models/Template');
const { validateTemplateUpdate } = require('./RouteHelpers/Template');
const { validateObjectId } = require('./RouteHelpers/Common');

const auth = require('../Middlewares/auth');
const authUrl = require('../Middlewares/authUrl');
const hasTemplateAccess = require('../Middlewares/hasTemplateAccess');
const hasDynamicGetAccess = require('../Middlewares/hasDynamicGetAccess');

router.post('/', auth, hasTemplateAccess, async (req, res) => {
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
      title: { $regex: new RegExp('^' + template.title + '$', 'i') },
      adminId: req.user.adminId,
    });
    if (templateInDb)
      return res.status(400).send({
        field: {
          name: 'title',
          message: 'A Template with this name already exist',
        },
      });

    templateInDb = await new Template({
      ...template,
      adminId: req.user.adminId,
    }).save();
    res.status(200).send({
      field: {
        message: 'Successfully Added',
        data: templateInDb,
        name: 'successful',
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/', auth, hasTemplateAccess, async (req, res) => {
  try {
    const { _id } = req.query;
    const { error } = validateObjectId({ _id: _id });
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const templateInDb = await Template.deleteOne({
      _id,
      adminId: req.user.adminId,
    });
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: templateInDb,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/', auth, hasTemplateAccess, async (req, res) => {
  try {
    const { createdAt, _id, adminId, __v, ...template } = req.body;

    const { error } = validateTemplateUpdate({ ...template, _id });
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const templateInDb = await Template.findOne().and([
      {
        title: { $regex: new RegExp('^' + template.title + '$', 'i') },
      },
      { adminId: req.user.adminId },
      { _id: { $ne: _id } },
    ]);

    if (templateInDb)
      return res.status(400).send({
        field: {
          name: 'title',
          message: 'A Template with this name already exist',
        },
      });

    await Template.updateOne({ _id, adminId: req.user.adminId }, template);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: await Template.findById(_id),
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get(
  '/',
  auth,
  (...args) => {
    hasDynamicGetAccess(['quickSend', 'templateManagement', 'inbox'], ...args);
  },
  async (req, res) => {
    try {
      res.status(200).send({
        field: {
          name: 'successful',
          message: 'Successfully Fetched',
          data: await Template.find({ adminId: req.user.adminId }),
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        field: { message: 'Unexpected error occured', name: 'unexpected' },
      });
    }
  }
);

router.get('/:property/:value', auth, hasTemplateAccess, async (req, res) => {
  try {
    const { property, value } = req.params;
    const templatesInDb = await Template.find({
      [property]: value,
      adminId: req.user.adminId,
    });
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: templatesInDb,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get(
  '/exportTemplates',
  (...args) => {
    authUrl(...args);
  },
  hasTemplateAccess,
  async (req, res) => {
    try {
      let data = await Template.find({ adminId: req.user.adminId });
      data = data.map((d) => [
        d.title || null,
        d.content || null,
        d.createdAt || null,
      ]);

      data.unshift(['Title', 'Content', 'Created At']);

      const options = {
        '!cols': [{ wch: 6 }, { wch: 7 }, { wch: 10 }, { wch: 20 }],
      };

      const buffer = xlsx.build([{ name: 'myTemplates', data: data }], options);

      const fileContents = Buffer.from(buffer, 'base64');

      const readStream = new stream.PassThrough();
      readStream.end(fileContents);

      res.set(
        'Content-disposition',
        'attachment; filename=' + 'myTemplates.xlsx'
      );
      res.set('Content-Type', 'text/plain');

      readStream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        field: { message: 'Unexpected error occured', name: 'unexpected' },
      });
    }
  }
);

module.exports = router;
