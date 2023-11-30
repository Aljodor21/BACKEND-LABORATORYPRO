const express = require('express');
const router = express.Router();
const email = require('../lib/email');

//Instancia de nuestra base de datos
const db = require('../database');
const {isAdmin,isLoggedIn} = require('../lib/validar');

//Metodo para mostrar los usuarios con solicitudes de tipo pendiente
router.get("/",isLoggedIn,isAdmin,async (req,res)=>{

    try{
        const pool =await db.iniciar();
        const conn = await pool.getConnection();

        let result = await conn.execute(`SELECT id_usuario,nombre,papellido,correo,fecha_registro,tipo_usuario FROM USUARIOS INNER JOIN TIPOS ON ID_TIPO=CODIGO_TIPO WHERE CODIGO_ESTADO= :cod`,[1]);

        await conn.release();

        const obj = [];

        const data = result.rows.map(row=>{
            obj.push( {
                id_usuario:row[0],
                nombre:row[1],
                papellido:row[2],
                correo:row[3],
                fecha_registro:row[4],
                codigo_tipo:row[5]
            });
        })

        res.render("admin/solicitudes",{layout: 'main2',obj});

    }catch(e){
        console.log('Error al realizar la consulta: ',e);
    }

    
});

//Ruta para rechazar a las personas que no se desean.
router.get('/rechazado/:id',isLoggedIn,isAdmin, async(req,res)=>{
    try {
        let id_usuario = req.params.id;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE USUARIOS SET CODIGO_ESTADO=:ESTADO WHERE ID_USUARIO=:ID',[3,id_usuario]);

        const ema = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[id_usuario]);

        if(result.rowsAffected && result.rowsAffected === 1)
        {
            email.mailOptions = {
                to: ema.rows[0][4],
                subject: "LaboratoryPro",
                text: "Tu solicitud en nuestra página ha sido rechazada, debes comunicarte con el administrador del sitio"
            }
            await email.transporter.sendMail(email.mailOptions);
            await conn.commit();
            await conn.release();
            req.flash('success','Usuario rechazado con exito');
            res.redirect('/admin')

        }
        
    } catch (e) {
        console.log('Error al realizar la consulta',e);
    }
});

//Ruta para aceptar a las personas que deseamos.
router.get('/aceptado/:id',isLoggedIn,isAdmin, async(req,res)=>{
    try {
        let id_usuario = req.params.id;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE USUARIOS SET CODIGO_ESTADO=:ESTADO WHERE ID_USUARIO=:ID',[2,id_usuario]);

        const ema = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[id_usuario]);

        if(result.rowsAffected && result.rowsAffected === 1)
        {
            email.mailOptions = {
                to: ema.rows[0][4],
                subject: "LaboratoryPro",
                text: "Tu cuenta ha sido activada, ahora puedes hacer uso de todas nuestras funciones"
            }
            await email.transporter.sendMail(email.mailOptions);
            await conn.commit();
            await conn.release();
            req.flash('success','Usuario aceptado con exito');
            res.redirect('/admin')
        }
        
    } catch (e) {
        console.log('Error al realizar la consulta',e);
    }
});

//Ruta para mostrar mis usuarios registrados, sea en estado de aprobado o rechazado
router.get("/registrados",isLoggedIn,isAdmin,async (req,res)=>{

    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT id_usuario,nombre,papellido,correo,fecha_registro,tipo_usuario,estado FROM USUARIOS INNER JOIN TIPOS ON ID_TIPO=CODIGO_TIPO INNER JOIN ESTADOS ON ID_ESTADO=CODIGO_ESTADO WHERE CODIGO_ESTADO=:ID1 OR CODIGO_ESTADO=:ID2 ORDER BY ID_USUARIO',[2,3]);

        await conn.release();
        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_usuario:row[0],
                nombre:row[1],
                papellido:row[2],
                correo:row[3],
                fecha_registro:row[4],
                codigo_tipo:row[5],
                codigo_estado:row[6]
            });
        });

        res.render("admin/registrados",{layout:'main2',obj});
    } catch (e) {
        console.log('Error al realizar la consulta',e)
    }
    
});

//Ruta para editar usuarios creados
router.get("/editRegistrados/:id",isLoggedIn,isAdmin,async (req,res)=>{
    try{
        const id_usuario = req.params.id;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[id_usuario])

        await conn.release();

        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_usuario:row[0],
                nombre:row[1],
                papellido:row[2],
                sapellido:row[3],
                correo:row[4],
                contrasena:row[5],
                fecha_registro:row[6],
                codigo_tipo:row[7],
                codigo_estado:row[8]
            });
        });
        res.render("admin/editRegistrados",{layout:'main2',obj:obj[0]});

    }catch(e){
        console.log('Error al realizar consulta de edición')
    }
    
});

router.post("/editRegistrados/:id",isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id} = req.params;
        const {nombre,papellido,sapellido,correo,codigo_tipo,codigo_estado} = req.body;
        const newUser = {
            nombre,
            papellido,
            sapellido,
            correo,
            codigo_tipo,
            codigo_estado
        }

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE USUARIOS SET NOMBRE=:NO,PAPELLIDO=:PA,SAPELLIDO=:SA,CORREO=:CO,CODIGO_TIPO=:CT,CODIGO_ESTADO=:CE WHERE ID_USUARIO=:ID',[nombre,papellido,sapellido,correo,codigo_tipo,codigo_estado,id]);


        if(result.rowsAffected && result.rowsAffected >= 1){
            console.log('usuario actualizado')
            await conn.commit();
            await conn.release()
            req.flash('success','Usuario editado con exito');
            res.redirect('/admin/registrados');
        }else{
            await conn.release()
        }



    } catch (e) {
        console.log('Error al actualizar al usuario: ',e)
    }

});

//Ruta para eliminar un usuario registrado
router.get('/eliminarRegistrado/:id',isLoggedIn,isAdmin,async (req,res)=>{
    const id = req.params.id
    
    try {
        if(req.user[7] == 1){
            req.flash('successf','El usuario no se puede borrar, es un administrador del sistema');
            res.redirect('/admin/registrados')
        }

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM USUARIOS WHERE ID_USUARIO=:ID',[id]);
        
        if(result.rowsAffected && result.rowsAffected >= 1){
            console.log("usuario eliminado")
            await conn.commit();
            await conn.release();
            req.flash('success','Usuario eliminado con exito');
            res.redirect('/admin/registrados')
        }
    } catch (e) 
    {
        req.flash('successf','El usuario no se puede borrar, tiene proyectos asociados a el');
        res.redirect('/admin/registrados')
        console.log('Error al realizar la consulta ',e)
    }
});

//RUTAS PARA HACER CRUD CON LAS TABLAS FUERTES
router.get("/estados",isLoggedIn,isAdmin,async(req,res)=>{
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM ESTADOS ORDER BY ID_ESTADO');

        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_estado:row[0],
                nombre:row[1]
            });
        });

        //Con estas querys validamos que ningún usuario tenga un estado para poder borrarlo
        const pendiente = await conn.execute('SELECT * FROM USUARIOS WHERE CODIGO_ESTADO = 1');
        const activo = await conn.execute('SELECT * FROM USUARIOS WHERE CODIGO_ESTADO = 2');
        const rechazado = await conn.execute('SELECT * FROM USUARIOS WHERE CODIGO_ESTADO = 3');

        res.render("admin/estados",{layout:'main2',obj,pendiente,activo,rechazado});
    } catch (e) 
    {
        console.log('Error al consultar los estados de la aplicación ',e)
    }
    
});

//Metodo para insertar un nuevo estado
router.post('/estados',isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id_estado,estado} = req.body;
        console.log(id_estado,estado)
        const newEstado = {
            id_estado,
            estado
        }
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('INSERT INTO ESTADOS(ID_ESTADO,ESTADO) VALUES(:ID,:ESTADO)',[id_estado,estado]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            console.log('Estado agregado');
            req.flash('success','Estado agregado con exito');
            res.redirect('/admin/estados');
        }else{
            await conn.release();
            res.redirect('/admin/estados');
        }

    } catch (e) {
        console.log('Error al crear el estado ',e);
        res.redirect('/admin/estados');
    }
})

router.get('/borrarEstado/:id',isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id} = req.params;
        
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM ESTADOS WHERE ID_ESTADO=:ID',[id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Estado borrado con exito');
            res.redirect('/admin/estados');
        }else{
            await conn.release();
            res.redirect('/admin/estados');
        }
    } catch (e) {
        console.log('Error al borrar estado ',e);
        req.flash('successf','El estado no puede ser borrado')
        res.redirect('/admin/estados');
    }
});

router.get("/editEstados/:id",isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id} = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM ESTADOS WHERE ID_ESTADO=:ID',[id]);
        
        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_estado: row[0],
                estado:row[1]
            });
        });

        res.render("admin/editEstados",{layout:'main2',obj:obj[0]});
    } catch (e) {
        console.log('Error al actualizar estado ',e)
    }
    
});

router.post("/editEstados/:id",isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id} = req.params;
        const {estado} = req.body;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE ESTADOS SET ESTADO=:ESTADO WHERE ID_ESTADO=:ID',[estado,id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Estado editado con exito');
            res.redirect('/admin/estados')

        }else{
            await conn.release();
            res.redirect('/admin/estados')
        }

    } catch (e) {
        console.log('Error al actualizar el estado ',e);
        res.redirect('/admin/estados')
    }
});

//Rutas para hacer CRUD con tipos
router.get("/tipos",isLoggedIn,isAdmin,async (req,res)=>{
    try 
    {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM TIPOS ORDER BY ID_TIPO')

        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_tipo:row[0],
                nombre:row[1]
            });
        });


        res.render("admin/tipos",{layout:'main2',obj});
    } catch (e) {
        console.log('Error al consultar los tipos de cuentas ', e)
    }
    
});

router.post('/tipos',isLoggedIn,isAdmin, async(req,res)=>{
    try {
        const {id_tipo,tipo} = req.body;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('INSERT INTO TIPOS(ID_TIPO,TIPO_USUARIO) VALUES(:ID,:TIPO)',[id_tipo,tipo]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            console.log('Tipo insertado correctamente');
            await conn.commit();
            await conn.release();
            req.flash('success','Tipo de usuario creado con exito');
            res.redirect('/admin/tipos');
        }else{
            await conn.release();
            res.redirect('/admin/tipos');
        }

    } catch (e) {
        console.log('Error al insertar tipo ',e);
        res.redirect('/admin/tipos');
    }
});

router.get('/borrarTipo/:id',isLoggedIn,isAdmin, async(req,res)=>{
    try {
        const {id} = req.params;
        
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM TIPOS WHERE ID_TIPO=:ID',[id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Tipo de usuario borrado con exito');
            res.redirect('/admin/tipos');
        }else{
            await conn.release();
            res.redirect('/admin/tipos');
        }

    } catch (e) {
        console.log('Error al borrar el tipo de usuario ',e);
        req.flash('successf','No se puede eliminar el tipo de usuario ')
        res.redirect('/admin/tipos');
    }
});

router.get("/editTipos/:id",isLoggedIn,isAdmin,async (req,res)=>{
    try {
        const {id} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();
        
        const result = await conn.execute('SELECT * FROM TIPOS WHERE ID_TIPO=:ID',[id]);

        await conn.release();

        const obj = [];

        const data = result.rows.map(row=>{
            obj.push({
                id_tipo: row[0],
                nombre_tipo:row[1]
            })
        })

        res.render("admin/editTipos",{layout:'main2',obj:obj[0]});
    } catch (e) {
        console.log('Error al consultar el tipo')
    }
    
});

router.post('/editTipos/:id',isLoggedIn,isAdmin, async(req,res)=>{
    try{
        const {id} = req.params;
        const {tipo_usuario} = req.body

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE TIPOS SET TIPO_USUARIO=:TIPO WHERE ID_TIPO=:ID',[tipo_usuario,id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Tipo de usuario actualizado con exito');
            res.redirect('/admin/tipos')
        }else{
            await conn.release();
            res.redirect('/admin/tipos')
        }
    }catch(e){
        console.log('Error al actualizar el tipo de usuario ',e)
        res.redirect('/admin/tipos')
    }
});

module.exports = router;