const nodemailer = require('nodemailer');
const config = require('config');

async function sendEmployeeVerificationEmail(email, token, origin) {
  let message;
  if (origin) {
    const verifyUrl = `${origin}/employeeAccount/verify-email?token=${token}`;
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
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: config.get('USER'),
      pass: config.get('PASS'),
    },
  });
  await transporter.sendMail({ to, subject, html });
}

exports.sendEmail = sendEmail;
exports.sendEmployeeVerificationEmail = sendEmployeeVerificationEmail;
