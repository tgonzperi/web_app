const nodemailer = require('nodemailer');
const fromMail = 'errors.web.app@gmail.com';
const toMail = 'tgonzperi@gmail.com';
const subject = 'Error message';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: fromMail ,
      pass: 'Sbq4504P'
  }
  });


function sendMail(message){
    let mailOptions = {
        from: fromMail,
        to: toMail,
        subject: subject,
        text: message
        };
    transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log("Error :", error);
        }
        });
}

module.exports = sendMail;