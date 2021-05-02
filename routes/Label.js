const express = require('express');
const router = express.Router();
const { Label, validateLabel } = require('../models/Label');
const { Lead } = require('../models/Lead');
const { validateObjectId } = require('./RouteHelpers/Common');

router.post('/', async (req, res) => {
  try {
    const { error } = validateLabel(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const { title } = req.body;

    if (
      await Label.findOne({
        title: { $regex: new RegExp('^' + title + '$', 'i') },
      })
    ) {
      return res.status(400).send({
        field: {
          name: 'name',
          message:
            'Sorry, duplicate label found with the same name. Name should be unique.',
        },
      });
    }
    const label = await new Label(req.body).save();

    res.status(200).send({
      field: {
        message: 'Successfully registered',
        name: 'successful',
        data: label,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Server Error!', name: 'unexpected' },
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    let labels = await Label.find();
    labels = JSON.stringify(labels);
    labels = JSON.parse(labels);
    const labelCounts = await Lead.aggregate([
      { $unwind: '$labels' },
      { $group: { _id: '$labels', labelCount: { $sum: 1 } } },
    ]);
    labels = labels.map((l) => {
      const label = labelCounts.find((c) => c._id == l._id);
      if (label) {
        return { ...l, count: label.labelCount };
      } else {
        return { ...l, count: 0 };
      }
    });
    const labelsHash = {};
    labels.map((l) => {
      labelsHash[l._id] = l;
    });
    return res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: labelsHash,
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
    const { _id } = req.query;
    const { error } = validateObjectId(req.query);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Label.findById(_id),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/', async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const { error } = validateLabel(data);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const { error: error2 } = validateObjectId({ _id: _id });
    if (error2) {
      return res.status(400).send({
        field: {
          message: error2.details[0].message,
          name: error2.details[0].path[0],
        },
      });
    }

    if (!(await Label.findById(_id))) {
      return res.status(400).send({
        field: { name: 'Label Id', message: 'No Label with this Id exist' },
      });
    }

    const { title } = data;

    if (
      await Label.findOne().and([
        {
          title: title,
        },
        { _id: { $ne: _id } },
      ])
    ) {
      return res.status(400).send({
        field: {
          name: 'title',
          message:
            'Sorry, duplicate label found with the same name. Name should be unique.',
        },
      });
    }

    const updatedLabel = await Label.updateOne({ _id: _id }, data);
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: updatedLabel,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { error } = validateObjectId(req.query);
    if (error)
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });

    const { _id } = req.query;

    const label = await Label.findByIdAndDelete(_id);
    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: label,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

module.exports = router;
