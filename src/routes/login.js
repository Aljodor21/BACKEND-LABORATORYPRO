const express = require("express");
const router = express.Router()

//Creamos una instancia de la base de datos, para realizar las diferentes consultas y tambien una instancia de nuestra authenticacion, tambien un modulo para encriptar contraseña
const db = require('../database')
const passport = require('passport');
const bcrypt = require('../lib/helpers');



router.get('/', (req, res) => {
    res.render('login/ingresar')

});

router.post('/', (req,res,next)=>{
    passport.authenticate('local.ingreso', {
        successRedirect: '/perfil',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
});

router.get('/registro', (req, res) => {
    res.render('login/registrar')

});

router.post('/registro', async (req, res) => {
    const { nombre, papellido, sapellido,correo,contrasena, codigo_tipo } = req.body;

    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const id = await conn.execute('SELECT * FROM USUARIOS ORDER BY ID_USUARIO');


        let ultimo_id = 1;

        for (let i = 0; i < id.rows.length; i++) {
            if (i == id.rows.length - 1) {
                ultimo_id = id.rows[i][0] + 1;
            }
        }

        const newUser = {
            id_usuario: ultimo_id,
            nombre,
            papellido,
            sapellido,
            correo,
            contrasena,
            codigo_tipo,
            codigo_estado: 1
        }

        newUser.contrasena = await bcrypt.cifrar(newUser.contrasena);
        console.log(newUser);

        const result = await conn.execute('INSERT INTO USUARIOS VALUES(:id,:nombre,:papellido,:sapellido,:correo,:contrasena,SYSDATE,:ct,:ce)', [newUser.id_usuario, newUser.nombre, newUser.papellido, newUser.sapellido, newUser.correo, newUser.contrasena, newUser.codigo_tipo, newUser.codigo_estado]);


        if (result.rowsAffected && result.rowsAffected >= 1) {

            await conn.commit();
            await conn.release();
            req.flash('success','Usuario creado, debes esperar aprobación del administrador');
            res.redirect('/');

        } else {
            await conn.release();
        }
    } catch (error) {
        req.flash('successf','No se pudo crear el usuario, debes comunicarte con el administrador');
        console.log('Error al crear usuario ', error)
    }
});

router.get('/cerrars',(req,res)=>{
    req.logOut((err)=>{
        if(err){
            console.log('Error al cerrar la sesión')
        }else{
            res.redirect('/login');
        }
    });
    
});

module.exports = router