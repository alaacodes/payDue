const path = require('path');
const handlebars = require('handlebars');
const fs = require('fs');
const nodemailer = require("nodemailer");
const config = require('../config/config')
const logger = require('../config/logger')

//Instantiate nodemailer
const transporter = nodemailer.createTransport(config.email);

//Send Email Channel
const sendEmail = async (to, subject, text, html = null) => {
  const msg = { from: config.email.from, to, subject, text, html };
  await transporter.sendMail(msg).then((value) => {
    return value
  });
};

//Email Services
const sendVerificationEmail = async (email, token, name) => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `http://localhost/auth/login?token=${token}`;
  const text = `Dear user,
        To verify your email, click on this link: ${verificationEmailUrl}`;

  const template = await parseHtml('/emails/verification.html')
  const replacement = {
    name,
    verificationEmailUrl,
  };
  const htmlToSend = template(replacement);

  return await sendEmail(email, subject, text, htmlToSend);
}

const resetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  const resetUrl = `http://localhost/auth/reset?token=${token}`;
  const text = `Dear user,
        To reset your account, click on this link: ${resetUrl}`;

  const template = await parseHtml('/emails/reset.html')
  const replacement = {
    resetUrl,
  };
  const htmlToSend = template(replacement);

  return await sendEmail(to, subject, text, htmlToSend);
}

const parseHtml = async (url) => {
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, url);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  return template
}

//Verify connection
if (config.env !== 'test') {
  transporter
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}


module.exports = { sendVerificationEmail, resetPasswordEmail }