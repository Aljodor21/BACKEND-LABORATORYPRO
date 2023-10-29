const passport = require('passport');
const Strategy = require('passport-local').Strategy;

//Creo una instancia de mi base de datos para guardar los usuarios y para encriptar mi contraseña
const db = require('../database');
const helpers = require('./helpers');

passport.use('local.ingreso', new Strategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute("SELECT * FROM USUARIOS WHERE CORREO=:correo", [username]);
        

        if (result.rows.length > 0) {
            const user = {
                id_usuario: result.rows[0][0],
                nombre: result.rows[0][1],
                papellido: result.rows[0][2],
                sapellido: result.rows[0][3],
                correo: result.rows[0][4],
                contrasena: result.rows[0][5],
                fecha_registro: result.rows[0][6],
                codigo_tipo: result.rows[0][7],
                codigo_estado: result.rows[0][8]
            }
            
            if(user.codigo_estado === 2)
            {
                const validacion = await helpers.descifrar(password,user.contrasena);

                if(validacion){
                    done(null,user,req.flash('success','Bienvenid@ '+user.nombre))
                }else{
                    done(null,false,req.flash('successf','Contraseña incorrecta'))
                }
            }else if(user.codigo_estado === 1)
            {
                done(null,false,req.flash('successf','Usuario pendiente de admisión'));
            }else
            {
                done(null,false,req.flash('successf','Usuario rechazado'));
            }

        } else {
            return done(null,false,req.flash('successf','Usuario no existente'));
        }
    } catch (e) {
        console.log('Error al realizar la consulta ', e)
    }
}));



passport.serializeUser((user, done) => {
    
    done(null, user.id_usuario);
});

passport.deserializeUser(async (id_usuario, done) => {

    try {

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const rows = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID', [id_usuario]);

        done(null, rows.rows[0]);
    } catch (error) {
        console.log('Error al descerializar ', error)
    }

})