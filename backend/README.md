# Prathibha Nursing Home backend

This backend receives appointment requests and emails them to `manibabubendi@gmail.com`.

## One-time setup

1. Install [Node.js](https://nodejs.org/) (LTS version).
2. Open PowerShell in this `backend` folder.
3. Run `npm install`.
4. Copy `.env.example` to a new file called `.env`.
5. Enter your Gmail address and a Gmail **App Password** in `.env`. Do not use your ordinary Gmail password.

To create a Gmail App Password: enable two-step verification on the Gmail account used to send messages, then create an App Password in that account's Google security settings.

## Start the website

Run:

```powershell
npm start
```

Then open [http://localhost:3000](http://localhost:3000). Appointment forms will email the configured recipient automatically.

## Important

- Do not upload or commit `.env`; it contains private credentials.
- This backend only emails appointment details; it does not store medical records.
- Deploy it to a secure host before sharing the website publicly. Use HTTPS in production.
- The payroll portal is still a front-end demo and must not be used for real payroll information without proper authentication, encryption, access controls, and a secure database.
