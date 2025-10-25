// verify.js — verifica conexión SMTP con las credenciales en las variables de entorno
const nodemailer = require('nodemailer');

const user = process.env.EMAIL_USER || '';
const pass = process.env.EMAIL_PASS || '';

if (!user || !pass) {
  console.error('Faltan variables de entorno EMAIL_USER o EMAIL_PASS. Define ambas antes de ejecutar este script.');
  process.exit(2);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

transporter.verify()
  .then(() => {
    console.log('SMTP: Credenciales OK — conexión exitosa');
    process.exit(0);
  })
  .catch(err => {
    console.error('SMTP: Error de autenticación o conexión:');
    console.error(err && err.response ? err.response : err);
    process.exit(1);
  });
