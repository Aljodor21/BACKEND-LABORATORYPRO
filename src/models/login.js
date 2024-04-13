const express = require("express");
const router = express.Router();
const email = require('../controllers/email');

//Creamos una instancia de la base de datos, para realizar las diferentes consultas y tambien una instancia de nuestra authenticacion, tambien un modulo para encriptar contraseña, tambien el validador de rutas
const db = require('../database')
const passport = require('passport');
const bcrypt = require('../controllers/helpers');
const {isNotLoggeIn} = require('../controllers/validar');


router.get('/',isNotLoggeIn, (req, res) => {
    res.render('login/ingresar')

});

router.post('/',isNotLoggeIn, (req,res,next)=>{
    passport.authenticate('local.ingreso', {
        successRedirect: '/perfil',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next);
});

router.get('/registro',isNotLoggeIn, async(req, res) => 
{
    try 
    {
        const pool = await db.iniciar();
        const conn = await pool.getConnection(); 
        
        const result = await conn.execute('SELECT * FROM TIPOS WHERE ID_TIPO=2 OR ID_TIPO=3');
        const data = [];

        const rows = result.rows.map(row=>
        {
            data.push(row[1]);
        })
        console.log(data)
        res.render('login/registrar',{result:data})
    } catch (error) 
    {
        console.log('Error al consultar los tipos de usuarios permitidos')
    }

});

router.post('/registro',isNotLoggeIn, async (req, res) => {
    const { nombre, papellido, sapellido,correo,contrasena, codigo_tipo } = req.body;

    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const newUser = {
            nombre,
            papellido,
            sapellido,
            correo,
            contrasena,
            codigo_tipo,
            codigo_estado: 1
        }

        newUser.contrasena = await bcrypt.cifrar(newUser.contrasena);

        const result = await conn.execute('INSERT INTO USUARIOS VALUES(secuencia_usuarios.NEXTVAL,:nombre,:papellido,:sapellido,:correo,:contrasena,SYSDATE,:ct,:ce)', [newUser.nombre, newUser.papellido, newUser.sapellido, newUser.correo, newUser.contrasena, newUser.codigo_tipo, newUser.codigo_estado]);


        if (result.rowsAffected && result.rowsAffected >= 1) 
        {
            email.mailOptions = {
                to: correo,
                subject: "LaboratoryPro",
                text: "Acabas de crear una cuenta, debes esperar la activación por parte del administrador de la aplicación"
            }
            await email.transporter.sendMail(email.mailOptions);
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