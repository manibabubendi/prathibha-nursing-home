require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

const app = express();
app.set('trust proxy', 1);
const port = Number(process.env.PORT || 3000);
const requiredEnvironment = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM', 'APPOINTMENT_RECIPIENT'];

if (requiredEnvironment.some((name) => !process.env[name])) {
  console.error('Missing email settings. Copy .env.example to .env and complete every value.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..')));

const appointmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many appointment requests. Please try again in 15 minutes.' }
});

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().replace(/[<>]/g, '').slice(0, maxLength) : '';
}

app.post('/api/appointments', appointmentLimiter, async (request, response) => {
  const name = cleanText(request.body.name, 100);
  const phone = cleanText(request.body.phone, 30);
  const service = cleanText(request.body.service, 80);

  if (name.length < 2 || phone.length < 6 || service === 'Choose a service') {
    return response.status(400).json({ error: 'Please provide your name, phone number, and requested service.' });
  }

  try {
    await transporter.sendMail({
      from: `Prathibha Nursing Home <${process.env.MAIL_FROM}>`,
      to: process.env.APPOINTMENT_RECIPIENT,
      replyTo: process.env.MAIL_FROM,
      subject: `Appointment request — ${name}`,
      text: `New appointment request\n\nName: ${name}\nPhone: ${phone}\nRequested service: ${service}\nReceived: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    });
    return response.status(201).json({ message: 'Your appointment request has been received.' });
  } catch (error) {
    console.error('Appointment email failed:', error.message);
    return response.status(502).json({ error: 'We could not send your request right now. Please call the hospital directly.' });
  }
});

app.use(express.static(path.join(__dirname, "..")));

app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(port, '0.0.0.0' () => console.log(`Prathibha Nursing Home website is running at http://localhost:${port}`));
