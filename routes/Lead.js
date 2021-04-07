const express = require('express');
const multer = require('multer');
const parse = require('csv-parse');
const phone = require('phone');
const fs = require('fs');
const router = express.Router();
const { Lead, validateLead } = require('../models/Lead');
const { Label } = require('../models/Label');
const {
  isUrlValid,
  validateContent,
  isEmailValid,
  validateFilter,
} = require('./RouteHelpers/Lead');
const { validateObjectId } = require('./RouteHelpers/Common');

router.post('/create', async (req, res) => {
  try {
    const { error } = validateLead(req.body);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    const { phone: mobileNumber, email, labels, website } = req.body;

    if (mobileNumber && phone(mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message: 'Phone number is not valid',
        },
      });
    }

    if (website && !isUrlValid(website)) {
      return res.status(400).send({
        field: {
          name: 'website',
          message: 'Website Url is not valid',
        },
      });
    }

    if (
      mobileNumber &&
      (await Lead.findOne({
        phone: mobileNumber,
      }))
    ) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message: 'Sorry, duplicate contact found with the same phone number.',
        },
      });
    }

    if (
      email &&
      (await Lead.findOne({
        email: email,
      }))
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message:
            'Sorry, duplicate contact found with the same email address.',
        },
      });
    }

    for (label of labels) {
      if (!(await Label.findById(label)))
        return res.status(400).send({
          field: {
            name: 'labelId',
            message: 'One of the Label Id in labels array is not valid',
          },
        });
    }

    const lead = await new Lead(req.body).save();

    res.status(200).send({
      field: {
        message: 'Successfully registered',
        name: 'successful',
        data: lead,
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
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: await Lead.find(),
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
        data: await Lead.findById(_id),
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.get('/filter', async (req, res) => {
  try {
    Object.keys(req.query).map((f) => (req.query[f] = eval(req.query[f])));

    const {
      firstName,
      leadSource,
      companyName,
      labels,
      email,
      phone,
      city,
      state,
      zip,
      country,
    } = req.query;

    const { error } = validateFilter(req.query);
    if (error) {
      return res.status(400).send({
        field: {
          message: error.details[0].message,
          name: error.details[0].path[0],
        },
      });
    }

    for (label of labels) {
      const { error: error2 } = validateObjectId({ _id: label.labels });
      if (error2) {
        return res.status(400).send({
          field: {
            message: error2.details[0].message,
            name: error2.details[0].path[0],
          },
        });
      }
    }
    const query = eval({
      $and: [
        { $or: [...firstName] },
        { $or: [...leadSource] },
        { $or: [...companyName] },
        { $or: [...labels] },
        { $or: [...email] },
        { $or: [...phone] },
        { $or: [...city] },
        { $or: [...state] },
        { $or: [...zip] },
        { $or: [...country] },
      ],
    });

    const leads = await Lead.find(query);

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully Fetched',
        data: leads,
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
    const { error } = validateLead(data);
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

    if (!(await Lead.findById(_id))) {
      return res.status(400).send({
        field: { name: 'Lead Id', message: 'No Lead with this Id exist' },
      });
    }

    const { phone: mobileNumber, email, labels, website } = data;

    if (mobileNumber && phone(mobileNumber).length === 0) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message: 'Phone number is not valid',
        },
      });
    }

    if (website && !isUrlValid(website)) {
      return res.status(400).send({
        field: {
          name: 'website',
          message: 'Website Url is not valid',
        },
      });
    }

    if (
      mobileNumber &&
      (await Lead.findOne().and([
        {
          phone: mobileNumber,
        },
        { _id: { $ne: _id } },
      ]))
    ) {
      return res.status(400).send({
        field: {
          name: 'phone',
          message: 'Phone number already exist',
        },
      });
    }

    if (
      email &&
      (await Lead.findOne().and([
        {
          email: email,
        },
        { _id: { $ne: _id } },
      ]))
    ) {
      return res.status(400).send({
        field: {
          name: 'email',
          message: 'Email already Exist',
        },
      });
    }

    for (label of labels) {
      if (!(await Label.findById(label)))
        return res.status(400).send({
          field: {
            name: 'labelId',
            message: 'One of the Label Id in labels array is not valid',
          },
        });
    }

    const updatedLead = await Lead.updateOne({ _id: _id }, data);
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: updatedLead,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/labels', async (req, res) => {
  try {
    const { leads } = req.body;
    for (lead of leads) {
      const { _id, labels } = lead;

      const { error } = validateObjectId({ _id: _id });
      if (error) throw new Error('Object id is not valid');

      for (label of labels) {
        const { error } = validateObjectId({ _id: label });
        if (error) throw new Error('Object id is not valid');

        if (!(await Label.findById(label)))
          throw new Error('Label with id is not exist.');
      }

      await Lead.updateOne({ _id: _id }, { labels: labels });
    }
    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: {},
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
    const leads = JSON.parse(req.query.leads);
    leads.map((l) => {
      const { error } = validateObjectId({ _id: l });
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    });
    await Lead.deleteMany({
      _id: { $in: leads },
    });

    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
        data: {},
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/multiple', async (req, res) => {
  try {
    const { leads } = req.body;
    for (lead of leads) {
      const { error } = validateObjectId({ _id: lead });
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    }
    for (lead of leads) {
      await Lead.findByIdAndDelete(lead);
    }

    res.send({
      field: {
        name: 'successful',
        message: 'Successfully Deleted',
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/note', async (req, res) => {
  try {
    const { _id, noteId, content } = req.body;
    for (id of [_id, noteId]) {
      const { error } = validateObjectId({ _id: id });
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    }

    const { error: error2 } = validateContent({ content: content });
    if (error2) {
      return res.status(400).send({
        field: {
          message: error2.details[0].message,
          name: error2.details[0].path[0],
        },
      });
    }

    const lead = await Lead.findById(_id);
    if (!lead) {
      return res.status(400).send({
        field: { name: 'Lead Id', message: 'No Lead with this Id exist' },
      });
    }

    lead.notes = lead.notes.map((l) =>
      l._id === noteId ? { ...l, content: content } : l
    );
    await lead.save();

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: lead,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.delete('/note', async (req, res) => {
  try {
    const { _id, noteId } = req.body;
    for (id of [_id, noteId]) {
      const { error } = validateObjectId({ _id: id });
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    }

    const lead = await Lead.findById(_id);
    if (!lead) {
      return res.status(400).send({
        field: { name: 'Lead Id', message: 'No Lead with this Id exist' },
      });
    }

    lead.notes = lead.notes.filter((l) => l._id != noteId);
    console.log(lead);
    await lead.save();

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: lead,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.put('/addNote', async (req, res) => {
  try {
    const { _id, noteId, content } = req.body;
    for (id of [_id, noteId]) {
      const { error } = validateObjectId({ _id: id });
      if (error)
        return res.status(400).send({
          field: {
            message: error.details[0].message,
            name: error.details[0].path[0],
          },
        });
    }

    const { error: error2 } = validateContent({ content: content });
    if (error2) {
      return res.status(400).send({
        field: {
          message: error2.details[0].message,
          name: error2.details[0].path[0],
        },
      });
    }

    const lead = await Lead.findById(_id);
    if (!lead) {
      return res.status(400).send({
        field: { name: 'Lead Id', message: 'No Lead with this Id exist' },
      });
    }

    lead.notes.push({ content: content });
    await lead.save();

    res.status(200).send({
      field: {
        name: 'successful',
        message: 'Successfully updated',
        data: lead,
      },
    });
  } catch (error) {
    res.status(500).send({
      field: { message: 'Unexpected error occured', name: 'unexpected' },
    });
  }
});

router.post('/csvUpload', async (req, res) => {
  const csvFolderName = __dirname + '/../public/csv';

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, csvFolderName);
    },
    filename: function (req, file, cb) {
      cb(null, 'excelFile.csv');
    },
  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === '.csv' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      req.inValidFileFormat = true;
      cb('invalid format', false);
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 1,
    },
    fileFilter: fileFilter,
  });

  upload.single('excelFile')(req, res, function (err) {
    if (req.inValidFileFormat) {
      console.log(req.inValidFileFormat);
      res.status(400).send({
        field: {
          name: 'File',
          message: 'File format is not valid',
        },
      });
      return;
    } else if (err) {
      console.log(err);
      res.status(400).send({
        field: {
          name: 'File',
          message: 'Error occured during file save',
        },
      });
      return;
    }
    try {
      let csvData = [];
      fs.createReadStream(`${__dirname}/../public/csv/excelFile.csv`)
        .pipe(
          parse({
            delimiter: ',',
          })
        )
        .on('data', function (data) {
          csvData.push({
            firstName: data[0],
            lastName: data[1],
            leadSource: data[2],
            companyName: data[3],
            labels: data[4],
            email: data[5],
            phone: data[6],
            website: data[7],
            address: data[8],
            city: data[9],
            state: data[10],
            zip: data[11],
            country: data[12],
          });
        })
        .on('end', async function () {
          csvData.shift();

          csvData = csvData.filter((l) => !l.firstName);
          csvData = csvData.filter((l) => phone(l.phone).length !== 0);
          csvData = csvData.filter((l) => !isEmailValid(l.email));
          csvData = csvData.filter((l) => !isUrlValid(l.website));

          const query = await Lead.insertMany(csvData);
          res.status(200).send({
            field: {
              name: 'successful',
              message: 'Successfully upload',
              data: {},
            },
          });
        });
    } catch (err) {
      console.log(err);
      res.status(500).send({
        field: { message: 'Unexpected error occured', name: 'unexpected' },
      });
    }
  });
});
module.exports = router;
