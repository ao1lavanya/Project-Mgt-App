import nodemailer from 'nodemailer';



const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "process.env.SMTP_USER",
    pass: "process.env.SMTP_PASS",
  },
});

const sendEmail = async () =>{
    const response = await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to ,
    subject,
    html: "<b>Hello world?</b>", // HTML version of the message
  });
  return response
}


export default sendEmail;
