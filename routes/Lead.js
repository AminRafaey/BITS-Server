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
          message: 'Sorry, duplicate lead found with the same phone number.',
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
          message: 'Sorry, duplicate lead found with the same email address.',
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
      file.mimetype === 'text/csv' ||
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
      res.status(400).send({
        field: {
          name: 'File',
          message: 'File format is not valid',
        },
      });
      return;
    } else if (err) {
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
        .pipe(parse({ delimiter: ',' }))
        .on('data', function (data) {
          csvData.push({
            firstName: data[0],
            lastName: data[1],
            leadSource: data[2],
            companyName: data[3],
            email: data[4],
            phone: data[5],
            website: data[6],
            address: data[7],
            city: data[8],
            state: data[9],
            zip: data[10],
            country: data[11],
          });
        })
        .on('end', async function () {
          csvData.shift();

          let responseMsg = '';
          let realNumberOfLeads = csvData.length;
          csvData = csvData.filter((l) => l.firstName);

          realNumberOfLeads !== csvData.length &&
            (responseMsg = `${
              realNumberOfLeads === csvData.length
                ? 0
                : realNumberOfLeads - csvData.length
            } Leads are filtered out because their first name was empty and it can't be empty\n`);
          realNumberOfLeads = csvData.length;

          csvData = csvData.filter((l) =>
            l.phone ? phone(l.phone).length !== 0 : true
          );

          realNumberOfLeads !== csvData.length &&
            (responseMsg =
              responseMsg +
              `${
                realNumberOfLeads - csvData.length
              } Leads are filtered out because their phone number is not valid\n`);

          realNumberOfLeads = csvData.length;
          csvData = csvData.filter((l) =>
            l.email ? isEmailValid(l.email) : true
          );

          realNumberOfLeads !== csvData.length &&
            (responseMsg =
              responseMsg +
              `${
                realNumberOfLeads - csvData.length
              } Leads are filtered out because their email is not valid\n`);
          realNumberOfLeads = csvData.length;
          csvData = csvData.filter((l) =>
            l.website ? isUrlValid(l.website) : true
          );

          realNumberOfLeads !== csvData.length &&
            (responseMsg =
              responseMsg +
              `${
                realNumberOfLeads - csvData.length
              } Leads are filtered out because their website url is not valid\n`);

          let saved = 0;
          let rejectBczOfValidation = 0;
          let rejectBczOfPNRepetition = 0;
          let rejectBczOfERepetition = 0;

          for (lead of csvData) {
            try {
              const { error } = validateLead(lead);
              if (error) {
                rejectBczOfValidation++;
                continue;
              }

              const { phone: mobileNumber, email } = lead;

              if (
                mobileNumber &&
                (await Lead.findOne({
                  phone: mobileNumber,
                }))
              ) {
                rejectBczOfPNRepetition++;
                continue;
              }

              if (
                email &&
                (await Lead.findOne({
                  email: email,
                }))
              ) {
                rejectBczOfERepetition++;
                continue;
              }
              await new Lead(lead).save();
              saved++;
            } catch (err) {
              continue;
            }
          }
          rejectBczOfValidation > 0 &&
            (responseMsg =
              responseMsg +
              `${rejectBczOfValidation} Leads are filtered out because they are not validated\n`);

          rejectBczOfPNRepetition > 0 &&
            (responseMsg =
              responseMsg +
              `${rejectBczOfPNRepetition} Leads are filtered out because duplicate lead found with the same phone number\n`);

          rejectBczOfERepetition > 0 &&
            (responseMsg =
              responseMsg +
              `${rejectBczOfERepetition} Leads are filtered out because duplicate lead found with the same email\n`);

          responseMsg =
            responseMsg + `Total ${saved} Leads are successfully saved\n`;
          return res.status(200).send({
            field: {
              name: 'successful',
              message: responseMsg,
              data: {},
            },
          });
        })
        .on('error', function (err) {
          res.status(500).send({
            field: { message: err, name: 'unexpected' },
          });
        });
    } catch (err) {
      res.status(500).send({
        field: { message: 'Unexpected error occured', name: 'unexpected' },
      });
    }
  });
});

router.get('/downloadSample', async (req, res) => {
  const file = __dirname + '/../public/download/SampleLeads.csv';
  res.download(file);
});

module.exports = router;
