const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas
const db=require('../database');


//Rutas para visualizar todos los proyectos y para hacer El crud con los mismos
router.get("/proyectos",async (req,res)=>{
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS ORDER BY ID_PROYECTO');
       
        const obj = [];

        const data = result.rows.map((row)=>{
            obj.push({
                id_proyecto: row[0],
                nombre: row[1],
                introduccion: row[2],
                fecha_creacion: row[3],
            });
        });

        await conn.release();
        res.render('profesor/proyectos',{layout:'main2',obj})

    } catch (error) {
        console.log('Error al consultar proyectos',error)
    }
    
});

router.post('/proyectos',async (req,res) => {
    try {
        const {nombre_proyecto,introduccion} = req.body;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('INSERT INTO PROYECTOS VALUES(secuencia_proyectos.NEXTVAL,:np,:int,SYSDATE)',[nombre_proyecto,introduccion]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Proyecto creado con exito');
            res.redirect('/profesor/proyectos');
        }else{
            await conn.release()
        }
    } catch (error) {
        console.log('Error al crear proyecto ',error);
    }
});

router.get('/editProyecto/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:ID',[id]);

        const obj = [];

        const data = result.rows.map((row)=>{
            obj.push({
                id_proyecto: row[0],
                nombre: row[1],
                introduccion: row[2],
                fecha_creacion: row[3],
            });
        });

        await conn.release();
        res.render('profesor/editProyecto',{layout:'main2',obj:obj[0]})
    } catch (error) {
        console.log('Error al consultar la edición de un proyecto ',error);

    }
});

router.post('/editProyecto/:id',async (req,res)=>{
    try {
        const {id} = req.params;
        const {nombre,introduccion} = req.body;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE PROYECTOS SET NOMBRE_PROYECTO = :NP, INTRODUCCION=:INT WHERE ID_PROYECTO = :ID',[nombre,introduccion,id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Proyecto actualizado con exito');
            res.redirect('/profesor/proyectos');
        }else{
            await conn.release();
        }

    } catch (error) {
        console.log('Error al actualizar un proyecto ',error)
    }
});

router.get('/borrarProyecto/:id',async (req,res)=>{
    try {
        const {id} = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM PROYECTOS WHERE ID_PROYECTO=:ID',[id]);

        if(result.rowsAffected && result.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Proyecto eliminado con exito');
            res.redirect('/profesor/proyectos');
        }else{
            await conn.release();
        }
    } catch (error) 
    {   
        req.flash('successf','No se puede eliminar el proyecto porque tiene usuarios asociados a el')
        console.log('Error al borrar un proyecto ',error)
    }
});

//Asi podemos visualizar un proyecto en especifico y ver sus atributos
router.get("/viewPP/:id",async (req,res)=>{
    try {
        const {id} = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:id',[id]);
        const result2 = await conn.execute('SELECT * FROM AVANCES WHERE CODIGO_PROYECTO=:id',[id]);

        const obj = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2],
            fecha_creacion: result.rows[0][3]
        }

        const obj2 = [];

        const data = result2.rows.map((row=>{
            obj2.push({
                codigo_proyecto: row[0],
                codigo_usuario: row[1],
                descripcion_avance: row[2],
                retroalimentacion: row[3],
                codigo_coordinador: row[4],
            })
        }));

        await conn.release();
        res.render('profesor/viewPP',{layout:'main2',obj:obj,obj2})
    } catch (error) {
        console.log('Error al consultar proyecto '+error)
    }
    
})


//Ruta para enlazar estudiantes con proyectos en nuestra tabla pivote proyectos_usuarios
router.get('/',async (req,res)=>
{
    try 
    {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS');

        const obj = [];

        const data = result.rows.map(row=>
        {
            obj.push({
                id_proyecto: row[0],
                nombre_proyecto: row[1],
                fecha_creacion:row[3]
            })
        });

        res.render('profesor/profesor',{layout:'main2',obj:obj})
    } catch (error) 
    {
        console.log('Error al consultar proyectos registrados ',error);
    }
    
});


router.get('/asignar/:id',async (req,res)=>
{
    try 
    {
        
    } catch (error) 
    {
        
    }
    res.render('profesor/asignar',{layout:'main2'})
});
module.exports = router