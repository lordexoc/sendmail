import dotenv from 'dotenv';
import express from 'express';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    ciphers: 'TLSv1.2',
    rejectUnauthorized: false,
  },
  debug: true,
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Baglanti hatasi:', error);
  } else {
    console.log('Baglanti başarıli! TLS kullaniliyor.');
  }
});

async function sendEmail(to, content) {
  const mailOptions = {
    from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
    to: to,
    subject: 'New Course Created',
    text: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`success to: ${to}`);
  } catch (error) {
    console.error(`error to: ${to} - ${error.message}`);
  }
}

async function sendEmailsSequentially(mails, content) {
  for (const mail of mails) {
    await sendEmail(mail, content);
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

app.post('/send-emails', (req, res) => {
  const { mails, content } = req.body;

  if (!mails || !content) {
    return res.status(400).json({ error: 'Eposta listesi ve icerik gerekli' });
  }

  res.status(200).json({ message: 'istek alindi epostalar gonderiliyor.' });

  sendEmailsSequentially(mails, content);
});

app.listen(3000, () => {
  console.log('Sunucu 3000 portunda calisiyor');
});
