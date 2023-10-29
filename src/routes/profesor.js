const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas
const db=require('../database');

//Ruta para enlazar estudiantes con proyectos
router.get("/",async (req,res)=>{
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        //Consulta para llamar a los integrantes estudiantes activos
        const result = await conn.execute('SELECT * FROM USUARIOS WHERE CODIGO_TIPO=2 AND CODIGO_ESTADO=2 ORDER BY ID_USUARIO');

        const obj = [];

        const data = result.rows.map((row=>{
            obj.push({
                id_usuario: row[0],
                nombre_usuario: row[1],
                papellido: row[2],
                sapellido: row[3],
                correo_usuario: row[4],
                fecha_registro: row[6],
                codigo_tipo: row[7],
                codigo_estado: row[8]
            })
        }));

        console.log(obj)
        //Consulta para llamar a los proyectos que no tengan personas asociadas
        res.render('profesor/profesor',{layout:'main2',obj:obj})
    } catch (error) {
        console.log('Error al cargar los integrantes registrados ',error)
    }
    
    
});

//Rutas para visualizar todos los proyectos y para crear proyectos
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
})


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

        res.render('profesor/viewPP',{layout:'main2',obj:obj,obj2})
    } catch (error) {
        console.log('Error al consultar proyecto '+error)
    }
    
})
module.exports = router