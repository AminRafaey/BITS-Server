const mongoose = require('mongoose');
const config = require('config');
const { Lead, validateLead } = require('./models/Lead');
const { Template, validateTemplate } = require('./models/Template');
const { Customer, validateCustomer } = require('./models/Customer');
const { Label, validateLabel } = require('./models/Label');

const leads = [
  {
    title: 'Zong',
    mobileNumber: '923174343123',
  },
  {
    title: 'Ufone',
    mobileNumber: '923348035644',
  },
  {
    title: 'Telenor',
    mobileNumber: '923415511689',
  },
  {
    title: 'Amin',
    mobileNumber: '923364773099',
  },
];

const templates = [
  {
    title: 'New Admission',
    content: 'Thanks for joining Codemox in MERN stack course',
  },
  {
    title: 'Lead Retarget',
    content:
      'Codemox is now offering 50% discount for previous students on django course',
  },
  {
    title: 'New customers',
    content: 'Codemox is welcoming new customers',
    mediaType: 'video',
    media: 'hey',
  },
];

const customers = [
  {
    name: 'Amin',
    email: 'amin@gmail.com',
    country: 'Pakistan',
  },
  {
    name: 'Hamza',
    email: 'amin1@gmail.com',
    country: 'Pakistan',
  },
  {
    name: 'Abdullah',
    email: 'amin2@gmail.com',
    country: 'Pakistan',
  },
];

const labels = [
  {
    title: 'New customer',
    color: '#ffff',
  },
  {
    title: 'New Lead',
    color: '#ffff',
  },
  {
    title: 'Other',
    color: '#ffff',
  },
];
async function seed() {
  await mongoose.connect(config.get('db'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  await mongoose.connection.dropDatabase();

  for (let lead of leads) {
    const { error } = validateLead(lead);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Lead(lead).save();
  }

  for (let template of templates) {
    const { error } = validateTemplate(template);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Template(template).save();
  }

  for (let customer of customers) {
    const { error } = validateCustomer(customer);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Customer(customer).save();
  }

  for (let label of labels) {
    const { error } = validateLabel(label);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Label(label).save();
  }

  mongoose.disconnect();
  console.info('Done!');
}

seed();
