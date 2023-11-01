const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas
const db=require('../database');

//Ruta para enlazar estudiantes con proyectos en nuestra tabla pivote
router.get("/",async (req,res)=>{
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        //Consulta para llamar a los integrantes estudiantes activos
        const result = await conn.execute('SELECT * FROM USUARIOS WHERE CODIGO_TIPO=2 AND CODIGO_ESTADO=2 ORDER BY ID_USUARIO');

        const obj = [];

        let data = result.rows.map((row=>{
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

        const result2 = await conn.execute('SELECT codigo_proyecto FROM proyectos_usuarios GROUP BY codigo_proyecto HAVING COUNT(codigo_proyecto) >=2');

        console.log(result2.rows);

        const result3 = await conn.execute('SELECT * FROM PROYECTOS WHERE ORDER BY ID_PROYECTO');
        const obj2 = [];

        data = result3.rows.map((row)=>{
            obj2.push({
                id_proyecto:row[0],
                nombre_proyecto: row[1],
                introduccion:row[2],
                fecha_creacion:row[3]
            })
        })


        //Consulta para llamar a los proyectos que no tengan personas asociadas
        res.render('profesor/profesor',{layout:'main2',obj:obj,obj2:obj2})
    } catch (error) {
        console.log('Error al cargar los integrantes registrados ',error)
    }
    
    
});

router.post("/",async (req,res)=>{
    try {
        const {codigo_proyecto,integrante1,integrante2,integrante3} = req.body;
        
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        let consult;
        
        let one = parseInt(integrante1);
        let two = parseInt(integrante2);
        let three = parseInt(integrante3);

        if(one == two || one == three || two == three)
        {
            req.flash('successf','No puedes repetir el mismo código de un estudiante 2 veces');
            res.redirect('/profesor');
        };

        //Empezamos a validar para que no nos ingresen datos por ingresar, valido que el proyecto si exista
        const r = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:ID',[codigo_proyecto]);

        if(r.rows.length > 0){

            //Valido que el integrante 1 exista
            const r1 = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[integrante1]);

            if(r1.rows.length > 0)
            {

                //Valido que el integrante 2 exista
                const r2 = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[integrante2]);

                if(r2.rows.length > 0)
                {
                    //Valido que el integrante 3 exista
                    if(integrante3 == '')
                    {
                        consult = await conn.execute("INSERT INTO PROYECTOS_USUARIOS VALUES("+codigo_proyecto+",:id1)",[integrante1]);
                        consult = await conn.execute("INSERT INTO PROYECTOS_USUARIOS VALUES("+codigo_proyecto+",:id2)",[integrante2]);
                    }else
                    {
                        const r3 = await conn.execute('SELECT * FROM USUARIOS WHERE ID_USUARIO=:ID',[integrante3]);

                        if(r3.rows.length > 0){
                            consult = await conn.execute("INSERT INTO PROYECTOS_USUARIOS VALUES("+codigo_proyecto+",:id1)",[integrante1]);
                            consult = await conn.execute("INSERT INTO PROYECTOS_USUARIOS VALUES("+codigo_proyecto+",:id2)",[integrante2]);
                            consult = await conn.execute("INSERT INTO PROYECTOS_USUARIOS VALUES("+codigo_proyecto+",:id3)",[integrante3]);
                        }
                        else{
                            req.flash('successf','El codigo del integrante 3 es invalido');
                            res.redirect('/profesor')
                        }
                    }

                }else{
                    req.flash('successf','El codigo del integrante 2 es invalido');
                    res.redirect('/profesor')
                }

            }else{
                req.flash('successf','El codigo del integrante 1 es invalido');
                res.redirect('/profesor')
            }

        }else{
            req.flash('successf','Debes ingresar el código de un proyecto valido');
            res.redirect('/profesor')
        }

        if(consult.rowsAffected && consult.rowsAffected >= 1){
            await conn.commit();
            await conn.release();
            req.flash('success','Estudiantes enlazados con exito');
            res.redirect('/profesor');
        }else{
            await conn.release();
        }
        

    } catch (error) {
        console.log('Error al enlazar proyectos con usuarios ',error)
    }
});

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
    } catch (error) {
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

        res.render('profesor/viewPP',{layout:'main2',obj:obj,obj2})
    } catch (error) {
        console.log('Error al consultar proyecto '+error)
    }
    
})
module.exports = router