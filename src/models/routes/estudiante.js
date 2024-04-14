const express = require('express');
const router = express.Router();

//Instancia de mi base de datos
const db = require('../../database');
const {isStudent,isLoggedIn} = require('../../controllers/validar');

//Ruta para ver proyectos asignados y visualizar los proyectos
router.get('/',isLoggedIn,isStudent, async (req, res) => {
    try {
        const id = req.user[0];
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const projects = await conn.execute('SELECT * FROM PROYECTOS_USUARIOS WHERE CODIGO_USUARIO=:ID', [id]);

        const proyectos = [];
        let sql = 'SELECT * FROM PROYECTOS WHERE ID_PROYECTO '
        let result = undefined;

        if (projects.rows.length > 0) {
            for (let i = 0; i < projects.rows.length; i++) {
                if (i == projects.rows.length - 1) {
                    sql += ' = ' + projects.rows[i][0] + ' ORDER BY ID_PROYECTO';
                } else {
                    sql += ' = ' + projects.rows[i][0] + ' OR ID_PROYECTO';
                }
            }

            result = await conn.execute(sql);
        }

        if (result != undefined) {
            let data = result.rows.map(row => {
                proyectos.push({
                    id_proyecto: row[0],
                    nombre_proyecto: row[1],
                    fecha_creacion: row[3]
                })
            });
        }

        res.render('estudiante/estudiante', { layout: 'main2', projects, proyectos: proyectos });

    } catch (error) {
        console.log('Error al cargar los proyectos de un usuario ', error)
    }
});

router.get('/viewPE/:id',isLoggedIn,isStudent, async (req, res) => {

    try {
        const { id } = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:ID', [id]);

        const proyecto = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2]
        };

        const result2 = await conn.execute('SELECT id_avance,descripcion_avance,nombre,papellido FROM AVANCES INNER JOIN USUARIOS ON ID_USUARIO = CODIGO_USUARIO WHERE CODIGO_PROYECTO=:id ORDER BY ID_AVANCE',[id]);

        const avances = []

        const data = result2.rows.map(row => {
            avances.push({
                id_avance: row[0],
                descripcion:row[1],
                nombre: row[2],
                papellido: row[3],
                id_proyecto: proyecto.id_proyecto
            })
        });

        res.render('estudiante/viewPE', { layout: 'main2', proyecto,avances })
    } catch (error) {
        console.log('Error al consultar un proyecto en especifico ', error)
    }

});

router.get('/viewRetroalimentacion/:ip/:ia',isLoggedIn,isStudent,async(req,res)=>
{
    try 
    {
        const {ip,ia} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:id', [ip]);

        const obj = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2],
            fecha_creacion: result.rows[0][3]
        }
        const result2 = await conn.execute('SELECT id_avance,descripcion_avance,retroalimentacion FROM AVANCES WHERE ID_AVANCE=:id ', [ia]);

        let obj2 = {};
        if(result2.rows[0][2] != null)
        {
            let result3 = await conn.execute('SELECT id_avance,descripcion_avance,retroalimentacion,nombre,papellido FROM AVANCES INNER JOIN USUARIOS ON ID_USUARIO=CODIGO_PROFESOR WHERE ID_AVANCE=:id ', [ia]);


            obj2 = {
                id_avance: result2.rows[0][0],
                descripcion_avance: result2.rows[0][1],
                retroalimentacion: result2.rows[0][2],
                nombre: result3.rows[0][3],
                papellido: result3.rows[0][4],
                id_proyecto:obj.id_proyecto
            }

        }else
        {
            obj2 = {
                id_avance: result2.rows[0][0],
                descripcion_avance: result2.rows[0][1],
                retroalimentacion: result2.rows[0][2],
                id_proyecto:obj.id_proyecto
            }
        }
        
        
        res.render('estudiante/retroalimentacion',{layout:'main2',obj,obj2})
    } catch (error) 
    {
        console.log('Error al visualizar la retroalimentación ',error)
    }
});
//Ruta para mostrrar vista de avances 
router.get('/avances',isLoggedIn,isStudent, async (req, res) => {
    try {
        const id = req.user[0];
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const projects = await conn.execute('SELECT * FROM PROYECTOS_USUARIOS WHERE CODIGO_USUARIO=:ID', [id]);

        const proyectos = [];
        let sql = 'SELECT * FROM PROYECTOS WHERE ID_PROYECTO '
        let result = undefined;

        if (projects.rows.length > 0) {
            for (let i = 0; i < projects.rows.length; i++) {
                if (i == projects.rows.length - 1) {
                    sql += ' = ' + projects.rows[i][0] + ' ORDER BY ID_PROYECTO';
                } else {
                    sql += ' = ' + projects.rows[i][0] + ' OR ID_PROYECTO';
                }
            }

            result = await conn.execute(sql);
        }

        if (result != undefined) 
        {
            let data = result.rows.map(row => 
                {
                proyectos.push({
                    id_proyecto: row[0],
                    nombre_proyecto: row[1],
                    fecha_creacion: row[3],
                    id
                })
            });
        }


        res.render('estudiante/avances', { layout: 'main2',proyectos:proyectos});
        
    } catch (error) {
        console.log('Error al mostrar los avances del usuario ', error)
    }
});

router.get('/subirA/:idp/:idu/:av',isLoggedIn,isStudent, async(req, res) => 
{
    try 
    {
        const {idp,idu,av} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM AVANCES WHERE CODIGO_PROYECTO=:ID ORDER BY ID_AVANCE',[idp]);

        console.log(result.rows.length)
        console.log(av)

        if(result.rows.length > 0)
        {
            if(result.rows.length == 1 && (av==2 || av==3))
            {
                if(av==3)
                {
                    req.flash('successf','Debes subir primero el avance 2');
                    res.redirect('/estudiante/avances');
                }else{
                    res.render('estudiante/subir', { layout: 'main2',idp,idu,av});
                }
                
            }else if(result.rows.length == 2 &&  av==3)
            {
                res.render('estudiante/subir', { layout: 'main2',idp,idu,av});
            }else if(result.rows.length == 3)
            {
                req.flash('successf','Avance subido, debes esperar la retroalimentación');
                res.redirect('/estudiante/avances');
            }
            else
            {
                req.flash('successf','Avance subido, debes esperar la retroalimentación');
                res.redirect('/estudiante/avances');
            }

            
        }else
        {
            if(av==1){
                res.render('estudiante/subir', { layout: 'main2',idp,idu,av});
            }else{
                req.flash('successf','Debes subir primero el avance 1');
                res.redirect('/estudiante/avances');
            }
        }
        
    } catch (error) 
    {
        console.log('Error al consultar el avance del usuario ',error)
    }
    
});

router.post('/subirA/:idp/:idu/:av',isLoggedIn,isStudent, async(req, res) =>
{
    try 
    {
        const {idp,idu,av} = req.params;
        const {avance} = req.body;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('INSERT INTO AVANCES(id_avance,descripcion_avance,codigo_proyecto,codigo_usuario) VALUES(secuencia_avances.NEXTVAL,:avance,:idp,:idu)',[avance,idp,idu]);

        if(result.rowsAffected && result.rowsAffected >=1){
            await conn.commit();
            await conn.release();
            req.flash('success','Avance insertado con exito');
            res.redirect('/estudiante/avances')
        }else{
            await conn.release()
        }
    } catch (error) 
    {
        console.log('Error al subir el avance ',error)
    }
});

module.exports = router