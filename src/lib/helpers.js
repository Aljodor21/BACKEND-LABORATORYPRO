const helpers = {};
const bcrypt = require('bcryptjs');
const e = require('connect-flash');

helpers.cifrar = async (password) =>{
    const salt = await bcrypt.genSalt(10);
    const contrasena = await bcrypt.hash(password, salt);
    return contrasena;
};

helpers.descifrar = async (password, savepassword) => {
    try {
        return await bcrypt.compare(password, savepassword);
    } catch (error) {
        console.log('Error al descifrar la contraseña ',e)
    }
};

module.exports = helpers;