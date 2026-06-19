const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

// Initialize transporter using SMTP config
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP configuration error: %s', error.message);
  } else {
    logger.info('SMTP server is ready to send emails');
  }
});

/**
 * Send an email.
 * @param {Object} options - mail options { to, subject, html }
 * @returns {Promise<void>}
 */
const sendMail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: config.smtp.from,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
  logger.info('Sent email to %s with subject "%s"', to, subject);
};

module.exports = { sendMail };
