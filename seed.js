const mongoose = require('mongoose');
const config = require('config');
const { Contact, validateContact } = require('./models/Contact');
const { Template, validateTemplate } = require('./models/Template');

const contacts = [
  {
    name: 'Amin',
    mobileNumber: '923174343123',
  },
  {
    name: 'Ameen Rafaey',
    mobileNumber: '923348035644',
  },
];

const templates = [
  {
    name: 'New Admission',
    content: 'Thanks for joining nexus berry in MERN stack course',
    status: 'Default',
  },
  {
    name: 'Lead Retarget',
    content:
      'Nexus Berry is now offering 50% discount for previous students on django course',
  },
];

async function seed() {
  await mongoose.connect(config.get('db'), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  await mongoose.connection.dropDatabase();

  for (let contact of contacts) {
    const { error } = validateContact(contact);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Contact(contact).save();
  }

  for (let template of templates) {
    const { error } = validateTemplate(template);
    if (error) {
      console.log(error.details[0].message);
      return;
    }
    await new Template(template).save();
  }

  mongoose.disconnect();
  console.info('Done!');
}

seed();
