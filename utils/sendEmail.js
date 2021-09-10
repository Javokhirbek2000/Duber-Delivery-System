const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');
require('dotenv').config({ path: '../config.env' });

const sendEmail = catchAsync(async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `${process.env.EMAIL_USERNAME}`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
