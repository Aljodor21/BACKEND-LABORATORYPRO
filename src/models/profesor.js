const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas y validador de rutas
const db = require('../database');
const {isLoggedIn,isProfe}= require('../controllers/validar');

//Rutas para visualizar todos los proyectos y para hacer El crud con los mismos
router.get("/proyectos",isLoggedIn, isProfe, async (req, res) => {
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS ORDER BY ID_PROYECTO');

        const obj = [];

        const data = result.rows.map((row) => {
            obj.push({
                id_proyecto: row[0],
                nombre: row[1],
                introduccion: row[2],
                fecha_creacion: row[3],
            });
        });

        await conn.release();
        res.render('profesor/proyectos', { layout: 'main2', obj })

    } catch (error) {
        console.log('Error al consultar proyectos', error)
    }

});

router.post('/proyectos',isLoggedIn, isProfe, async (req, res) => {
    try {
        const { nombre_proyecto, introduccion } = req.body;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('INSERT INTO PROYECTOS VALUES(secuencia_proyectos.NEXTVAL,:np,:int,SYSDATE)', [nombre_proyecto, introduccion]);

        if (result.rowsAffected && result.rowsAffected >= 1) {
            await conn.commit();
            await conn.release();
            req.flash('success', 'Proyecto creado con exito');
            res.redirect('/profesor/proyectos');
        } else {
            await conn.release()
        }
    } catch (error) {
        console.log('Error al crear proyecto ', error);
    }
});

router.get('/editProyecto/:id',isLoggedIn, isProfe, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:ID', [id]);

        const obj = [];

        const data = result.rows.map((row) => {
            obj.push({
                id_proyecto: row[0],
                nombre: row[1],
                introduccion: row[2],
                fecha_creacion: row[3],
            });
        });

        await conn.release();
        res.render('profesor/editProyecto', { layout: 'main2', obj: obj[0] })
    } catch (error) {
        console.log('Error al consultar la edición de un proyecto ', error);

    }
});

router.post('/editProyecto/:id',isLoggedIn, isProfe, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, introduccion } = req.body;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('UPDATE PROYECTOS SET NOMBRE_PROYECTO = :NP, INTRODUCCION=:INT WHERE ID_PROYECTO = :ID', [nombre, introduccion, id]);

        if (result.rowsAffected && result.rowsAffected >= 1) {
            await conn.commit();
            await conn.release();
            req.flash('success', 'Proyecto actualizado con exito');
            res.redirect('/profesor/proyectos');
        } else {
            await conn.release();
        }

    } catch (error) {
        console.log('Error al actualizar un proyecto ', error)
    }
});

router.get('/borrarProyecto/:id',isLoggedIn, isProfe, async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM PROYECTOS WHERE ID_PROYECTO=:ID', [id]);

        if (result.rowsAffected && result.rowsAffected >= 1) {
            await conn.commit();
            await conn.release();
            req.flash('success', 'Proyecto eliminado con exito');
            res.redirect('/profesor/proyectos');
        } else {
            await conn.release();
        }
    } catch (error) {
        req.flash('successf', 'No se puede eliminar el proyecto porque tiene usuarios asociados a el')
        res.redirect('/profesor/proyectos');
    }
});

//Asi podemos visualizar un proyecto en especifico y ver sus atributos
router.get("/viewPP/:id",isLoggedIn, isProfe, async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:id', [id]);
        const result2 = await conn.execute('SELECT id_avance,descripcion_avance,nombre,papellido FROM AVANCES INNER JOIN USUARIOS ON ID_USUARIO = CODIGO_USUARIO WHERE CODIGO_PROYECTO=:id ORDER BY id_avance', [id]);

        const obj = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2],
            fecha_creacion: result.rows[0][3]
        }

        const obj2 = [];

        console.log(result2.rows)
        const data = result2.rows.map((row => {
            obj2.push({
                id_avance:row[0],
                descripcion_avance: row[1],
                nombre: row[2],
                papellido: row[3],
                id_proyecto: obj.id_proyecto
            })
        }));

        await conn.release();
        res.render('profesor/viewPP', { layout: 'main2', obj, obj2 });
    } catch (error) {
        console.log('Error al consultar proyecto ' + error)
    }

})

//Ruta para hacer retroalimentación
router.get('/retroalimentar/:ip/:ia',isLoggedIn, isProfe,async(req,res)=>
{
    try 
    {
        const {ip,ia} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:id', [ip]);

        const result2 = await conn.execute('SELECT * FROM AVANCES WHERE ID_AVANCE=:id', [ia]);

        const obj = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2],
            fecha_creacion: result.rows[0][3]
        }

        const obj2 = {
            id_avance: result2.rows[0][0],
            descripcion_avance: result2.rows[0][1],
            codigo_proyecto: result2.rows[0][2],
            codigo_estudiante: result2.rows[0][3],
            retroalimentacion: result2.rows[0][4],
            codigo_coordinador: result2.rows[0][5]
        }
        res.render('profesor/retro',{layout:'main2',obj,obj2})
    } catch (error) 
    {
        console.log('Error al retroalimentar proyecto ',error);
    }
});

router.post('/retroalimentar/:ip/:ia',isLoggedIn, isProfe,async(req,res)=>
{
    try 
    {
        const {ip,ia} = req.params;
        const {retroalimentacion} = req.body;

        console.log(req.user)
        const pool = await db.iniciar();
        const conn = await pool.getConnection();
        
        const result = await conn.execute('UPDATE AVANCES SET retroalimentacion=:ret,codigo_profesor=:cod WHERE id_avance=:id',[retroalimentacion,req.user[0],ia]);

        if(result.rowsAffected && result.rowsAffected >= 1)
        {
            await conn.commit();
            await conn.release();
            req.flash('success','Retroalimentación realizada con exito');
            res.redirect(`/profesor/retroalimentar/${ip}/${ia}`)
        }
    } catch (error) 
    {
        console.log('Error al publicar la retroalimentación del proyecto ',error);
    }
});

//Ruta para enlazar estudiantes con proyectos en nuestra tabla pivote proyectos_usuarios
router.get('/', isLoggedIn, isProfe, async (req, res) => {
    try {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS ORDER BY ID_PROYECTO');

        const obj = [];

        const data = result.rows.map(row => {
            obj.push({
                id_proyecto: row[0],
                nombre_proyecto: row[1],
                fecha_creacion: row[3]
            })
        });

        res.render('profesor/profesor', { layout: 'main2', obj: obj })
    } catch (error) {
        console.log('Error al consultar proyectos registrados ', error);
    }

});

//ruta para ver asignación de proyectos con usuarios
router.get('/asignar/:id',isLoggedIn, isProfe, async (req, res) => 
{
    try {
        const { id } = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        //Consultas para saber el nombre del proyecto
        const project = await conn.execute('SELECT nombre_proyecto FROM PROYECTOS WHERE ID_PROYECTO=:ID', [id]);

        const proyecto = project.rows[0][0];

        //Consultas para saber si hay estudiantes asociados al proyecto
        const students = await conn.execute('SELECT * FROM PROYECTOS_USUARIOS WHERE CODIGO_PROYECTO=:COD', [id]);

        let sql = 'SELECT ID_USUARIO,NOMBRE, PAPELLIDO FROM USUARIOS WHERE ID_USUARIO'

        let students2 = undefined;
        if (students.rows.length > 0) {
            for (let i = 0; i < students.rows.length; i++) {
                if (i == students.rows.length - 1) {
                    sql += ' = ' + students.rows[i][1] + ' ORDER BY ID_USUARIO';
                } else {
                    sql += ' = ' + students.rows[i][1] + ' OR ID_USUARIO';
                }
            }
            students2 = await conn.execute(sql);
        }
        const nombres = [];

        if (students2 != undefined) {

            let data = students2.rows.map(row => {
                nombres.push({
                    id_usuario: row[0],
                    nombre: row[1],
                    papellido: row[2],
                    id
                })
            });
        }

        //Consulta de estudiantes diferentes al proyecto
        let sql2 = 'SELECT ID_USUARIO,NOMBRE, PAPELLIDO FROM USUARIOS WHERE CODIGO_TIPO=2 AND CODIGO_ESTADO=2 AND ID_USUARIO'

        let students3;

        if (students.rows.length > 0) {
            for (let i = 0; i < students.rows.length; i++) {
                if (i == students.rows.length - 1) {
                    sql2 += ' <> ' + students.rows[i][1] + ' ORDER BY ID_USUARIO';

                } else {
                    sql2 += ' <> ' + students.rows[i][1] + ' AND ID_USUARIO';
                }
            }

            students3 = await conn.execute(sql2);
        } else {
            students3 = await conn.execute('SELECT ID_USUARIO,NOMBRE, PAPELLIDO FROM USUARIOS WHERE CODIGO_TIPO=2 AND CODIGO_ESTADO=2 ORDER BY ID_USUARIO');
        }

        const nombres2 = [];
        let data2 = students3.rows.map(row => {
            nombres2.push({
                id_usuario: row[0],
                nombre: row[1],
                papellido: row[2]
            })
        });


        //Renderizo mi vista 
        res.render('profesor/asignar', { layout: 'main2', proyecto, students, nombres: nombres, nombres2: nombres2, id });

    } catch (error) {
        console.log('Error al cargar usuarios asignados de proyectos ', error)
    }

});

//Ruta para agregar un usuario a un proyecto
router.post('/asignar/:id',isLoggedIn, isProfe, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        if (Object.keys(req.body).length == 0) {
            req.flash('successf', 'Recuerda que debes elegír minimo un usuario');
            res.redirect(`/profesor/asignar/${id}`)

        } else if (Object.keys(req.body).length > 3) {
            req.flash('successf', 'Recuerda que solo puedes elegir un maximo de tres estudiantes');
            res.redirect(`/profesor/asignar/${id}`)

        } else {
            const result = await conn.execute('SELECT * FROM PROYECTOS_USUARIOS WHERE CODIGO_PROYECTO=:COD', [id]);


            const obj = Object.keys(req.body);

            if (result.rows.length == 0) {
                let sql;

                for (let i = 0; i < obj.length; i++) {
                    sql = await conn.execute('INSERT INTO PROYECTOS_USUARIOS VALUES(:IP,:IU)', [id, obj[i]]);
                }

                if (sql.rowsAffected && sql.rowsAffected >= 1) {
                    await conn.commit();
                    await conn.release();
                    req.flash('success', 'Usuario agregado con exito');
                    res.redirect(`/profesor/asignar/${id}`);

                } else {
                    await conn.release();
                }
            }

            if (result.rows.length == 1) {
                if (obj.length == 1 || obj.length == 2) {
                    let sql;

                    for (let i = 0; i < obj.length; i++) {
                        sql = await conn.execute('INSERT INTO PROYECTOS_USUARIOS VALUES(:IP,:IU)', [id, obj[i]]);
                    }

                    if (sql.rowsAffected && sql.rowsAffected >= 1) {
                        await conn.commit();
                        await conn.release();
                        req.flash('success', 'Usuario agregado con exito');
                        res.redirect(`/profesor/asignar/${id}`);

                    } else {
                        await conn.release();
                    }
                } else {
                    req.flash('successf', 'Solo puedes registrar un maximo de dos estudiantes');
                    res.redirect(`/profesor/asignar/${id}`)
                }
            }

            if (result.rows.length == 2) {
                if (obj.length == 1) {
                    let sql = await conn.execute('INSERT INTO PROYECTOS_USUARIOS VALUES(:IP,:IU)', [id, obj[0]]);;


                    if (sql.rowsAffected && sql.rowsAffected >= 1) {
                        await conn.commit();
                        await conn.release();
                        req.flash('success', 'Usuario agregado con exito');
                        res.redirect(`/profesor/asignar/${id}`);

                    } else {
                        await conn.release();
                    }
                } else {
                    req.flash('successf', 'Solo puedes registrar un estudiante');
                    res.redirect(`/profesor/asignar/${id}`)
                }
            }

            if (result.rows.length == 3) {
                req.flash('successf', 'Ya no puede registrar mas estudiantes');
                res.redirect(`/profesor/asignar/${id}`)
            }
        }
    } catch (error) {
        console.log('Error al insertar usuarios al proyecto ', error)
    }
});

//Ruta para eliminar usuario de un proyecto
router.get('/asignar/eliminar/:id/:id2',isLoggedIn, isProfe, async (req, res) => {
    const {id,id2} = req.params;
    try 
    {
        
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM PROYECTOS_USUARIOS WHERE CODIGO_USUARIO=:COD AND CODIGO_PROYECTO=:COD2',[id,id2]);


        if (result.rowsAffected && result.rowsAffected >= 1) {
            await conn.commit();
            await conn.release();
            req.flash('success', 'Usuario eliminado con exito');
            res.redirect(`/profesor/asignar/${id2}`);

        } else {
            await conn.release();
        }
    } catch (error) 
    {
        req.flash('successf', 'No se puede eliminar el usuario porque tiene avances asociados');
        res.redirect(`/profesor/asignar/${id2}`);
        console.log('Error al eliminar un usuario de un proyecto ', error)
    }
});


module.exports = router