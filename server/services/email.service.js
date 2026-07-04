/**
 * Email service placeholder
 */
const sendEmail = async ({ to, subject, text, html }) => {
  console.log(`✉️ Sending email to: ${to} | Subject: ${subject}`);
  return true;
};

module.exports = { sendEmail };