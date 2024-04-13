const nodemailer = require('nodemailer');
const helpers = {};

//Creamos el objeto de transporte
helpers.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'laboratorypro1@gmail.com',
        pass: 'acgafzvefoywlvub'
    }
});

// Crear el mensaje de correo electrónico
helpers.mailOptions = {
    from: 'laboratorypro1@gmail.com',
    to: 'prueba@.com',
    subject: 'LaboratoryPro',
    text: 'Este es un correo de prueba enviado desde Node.js'
};


module.exports=helpers