require('dotenv').config();
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer');
const config = require('config');

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject('Failed to create access token :(');
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

async function sendVerificationEmail(email, token, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/adminAccount/verifyEmail?token=${token}`;
    message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${token}</code></p>`;
  }

  await sendEmail({
    to: email,
    subject: `BITS - Verify Email`,
    html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`,
  });
}

async function sendEmployeeVerificationEmail(email, token, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/employeeAccount/verifyEmail?token=${token}`;
    message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
  } else {
    message = `<p>Please use the below token to verify your email address with the <code>/account/verify-email</code> api route:</p>
                   <p><code>${token}</code></p>`;
  }

  await sendEmail({
    to: email,
    subject: `BITS - Verify Employee's Email`,
    html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`,
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = await createTransporter();
  await transporter.sendMail({ to, subject, html, from: process.env.EMAIL });
}

exports.sendEmail = sendEmail;
exports.sendEmployeeVerificationEmail = sendEmployeeVerificationEmail;
exports.sendVerificationEmail = sendVerificationEmail;
