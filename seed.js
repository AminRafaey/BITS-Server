const mongoose = require('mongoose');
const config = require('config');
const { Lead, validateLead } = require('./models/Lead');
const { Template, validateTemplate } = require('./models/Template');
const { Customer, validateCustomer } = require('./models/Customer');
const { Label, validateLabel } = require('./models/Label');
const { User, validateUser } = require('./models/User');

const users = [
  {
    email: 'aminrafaey543@gmail.com',
    userName: 'Amin Rafaey',
    password: '1234',
  },
];
const leads = [
  {
    title: 'Fayiz',
    jid: '923224797905@s.whatsapp.net',
    email: 'aminrafaey543@gmail.com',
    source: 'Facebook',
    location: 'Shad Bagh Lahore',
    labels: [],
    notes: [{ content: 'Treat him with special care' }],
  },
  {
    title: 'Fayiz',
    jid: '923222070707@s.whatsapp.net',
    email: 'aminrafaey543@gmail.com',
    source: 'Facebook',
    location: 'Shad Bagh Lahore',
    labels: [],
    notes: [{ content: 'Treat him with special care' }],
  },
  {
    title: 'Aliza',
    jid: '923224797905@s.whatsapp.net',
    email: 'aminrafaey543@gmail.com',
    source: 'Facebook',
    location: 'Shad Bagh Lahore',
    labels: ['602c00b0861536475c2f69ed', '602c00b0861536475c2f69ee'],
    notes: [{ content: 'Treat him with special care' }],
  },
  {
    title: 'Moeed',
    jid: '923222070707@s.whatsapp.net',
    email: 'aminrafaey543@gmail.com',
    source: 'Facebook',
    location: 'Shad Bagh Lahore',
    labels: [],
    notes: [{ content: 'Treat him with special care' }],
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
    title: 'Hot',
    description: 'This will be the label description',
    color: '#B60205',
  },
  {
    title: 'Cold',
    description: 'This will be the label description',
    color: '#D73A4A',
  },
  {
    title: 'New Lead',
    description: 'This will be the label description',
    color: '#0075CA',
  },
  {
    title: 'Old Customer',
    description: 'This will be the label description',
    color: '#CFD3D7',
  },
  {
    title: 'Reliable Lead',
    description: 'This will be the label description',
    color: '#A2EEEF',
  },
  {
    title: 'Warm',
    description: 'This will be the label description',
    color: '#7057FF',
  },
];
async function seed() {
  await mongoose.connect(config.get('db'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  // await mongoose.connection.dropDatabase();

  for (let user of users) {
    const { error } = validateUser(user);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new User(user).save();
  }

  // for (let lead of leads) {
  //   const { error } = validateLead(lead);
  //   if (error) {
  //     console.log(error.details[0].message);
  //     return;
  //   }
  //   await new Lead(lead).save();
  // }

  // for (let template of templates) {
  //   const { error } = validateTemplate(template);
  //   if (error) {
  //     console.log(error.details[0].message);
  //     return;
  //   }
  //   await new Template(template).save();
  // }

  // for (let customer of customers) {
  //   const { error } = validateCustomer(customer);
  //   if (error) {
  //     console.log(error.details[0].message);
  //     return;
  //   }
  //   await new Customer(customer).save();
  // }

  // for (let label of labels) {
  //   const { error } = validateLabel(label);
  //   if (error) {
  //     console.log(error.details[0].message);
  //     return;
  //   }
  //   await new Label(label).save();
  // }

  mongoose.disconnect();
  console.info('Done!');
}

seed();
