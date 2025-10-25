const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Habilitar CORS (útil si pruebas desde otro origen)
app.use(cors());

// Middleware para procesar JSON y archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Logger sencillo: escribe una línea por envío en enviados.log
const LOG_PATH = path.join(__dirname, 'enviados.log');
function logEntry(entry) {
  const line = `[${new Date().toISOString()}] ${entry}\n`;
  try {
    fs.appendFileSync(LOG_PATH, line, { encoding: 'utf8' });
  } catch (err) {
    console.error('No se pudo escribir en el log:', err);
  }
}

// Configurar nodemailer (solo variables de entorno)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Ruta para manejar el envío del formulario
app.post('/enviar-consulta', async (req, res) => {
  const { nombre, email, telefono, horario, mensaje } = req.body;
  const shortData = `nombre=${nombre}; email=${email}; telefono=${telefono}; horario=${horario}`;

  try {
    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nueva Consulta de Terapia',
      html: `
        <h3>Nueva consulta recibida</h3>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Horario preferido:</strong> ${horario}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `
    };

    // Enviar el email
    const info = await transporter.sendMail(mailOptions);

    // Respuesta automática al paciente
    const autoReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Gracias por contactar con Centro Bienestar Integral!',
      html: `
        <p>Estimado/a ${nombre},</p>
        <p>¡Gracias por ponerte en contacto con nosotros!</p>
        <p>Hemos recibido tu consulta y nos pondremos en contacto contigo en las próximas 24 horas para agendar tu cita.</p>
        <p>Si tienes alguna urgencia, puedes llamarnos directamente a la fisioterapeuta al <b>+34 604 249 083</b>.<br>
        También puedes contactar al centro al <b>+34 613 978 291</b> o escribirnos por WhatsApp.</p>
        <p>Con cariño,<br>Equipo de Centro Bienestar Integral</p>
      `
    };
    let autoReplyInfo = null;
    let autoReplyError = null;
    try {
      autoReplyInfo = await transporter.sendMail(autoReply);
      logEntry(`OK_AUTOREPLY to=${email} nombre=${nombre} messageId=${autoReplyInfo && autoReplyInfo.messageId ? autoReplyInfo.messageId : 'N/A'}`);
    } catch (err) {
      autoReplyError = err;
      logEntry(`ERROR_AUTOREPLY to=${email} nombre=${nombre} error=${err && err.message ? err.message : err}`);
    }

    // Log: éxito
    logEntry(`OK ${shortData} messageId=${info && info.messageId ? info.messageId : 'N/A'}`);

    // Enviar respuesta al cliente
    res.json({ 
      ok: true, 
      message: 'Consulta enviada correctamente'
    });
  } catch (error) {
    console.error('Error al enviar email:', error);
    // Log: error con mensaje breve
    logEntry(`ERROR ${shortData} error=${error && error.message ? error.message : error}`);
    res.status(500).json({ 
      ok: false, 
      message: 'Error al enviar la consulta'
    });
  }
});

// Puerto
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});