import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { SMTP_PASSWORD, SMTP_MAIL } = process.env;

// Configure smyp configaration 
const sendMail = async (email, mailSubject, content) => {
  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      sequre: false,
      requireTLS: true,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOption = {
      from: SMTP_MAIL,
      to: email,
      subject: mailSubject,
      html: content,
    };

    transport.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log("Error");
      } else {
        console.log("Mail Send Successfully Done", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export default sendMail;
