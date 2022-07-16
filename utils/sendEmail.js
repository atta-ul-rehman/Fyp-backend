const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_NAME,
      pass: process.env.GMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `<p><strong>Welcome To Falla Suport</strong> <b> Click <a href=${options.url}>Here</a> to ${options.message}</p>`,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
