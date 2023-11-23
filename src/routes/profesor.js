const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas
const db = require('../database');


//Rutas para visualizar todos los proyectos y para hacer El crud con los mismos
router.get("/proyectos", async (req, res) => {
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

router.post('/proyectos', async (req, res) => {
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

router.get('/editProyecto/:id', async (req, res) => {
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

router.post('/editProyecto/:id', async (req, res) => {
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

router.get('/borrarProyecto/:id', async (req, res) => {
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
        console.log('Error al borrar un proyecto ', error)
    }
});

//Asi podemos visualizar un proyecto en especifico y ver sus atributos
router.get("/viewPP/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM PROYECTOS WHERE ID_PROYECTO=:id', [id]);
        const result2 = await conn.execute('SELECT * FROM AVANCES WHERE CODIGO_PROYECTO=:id', [id]);

        const obj = {
            id_proyecto: result.rows[0][0],
            nombre: result.rows[0][1],
            introduccion: result.rows[0][2],
            fecha_creacion: result.rows[0][3]
        }

        const obj2 = [];

        const data = result2.rows.map((row => {
            obj2.push({
                codigo_proyecto: row[0],
                codigo_usuario: row[1],
                descripcion_avance: row[2],
                retroalimentacion: row[3],
                codigo_coordinador: row[4],
            })
        }));

        await conn.release();
        res.render('profesor/viewPP', { layout: 'main2', obj: obj, obj2 })
    } catch (error) {
        console.log('Error al consultar proyecto ' + error)
    }

})


//Ruta para enlazar estudiantes con proyectos en nuestra tabla pivote proyectos_usuarios
router.get('/', async (req, res) => {
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


router.get('/asignar/:id', async (req, res) => {
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
router.post('/asignar/:id', async (req, res) => {
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
router.get('/asignar/eliminar/:id/:id2', async (req, res) => {
    try 
    {
        const {id,id2} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('DELETE FROM PROYECTOS_USUARIOS WHERE CODIGO_USUARIO=:COD',[id]);


        if (result.rowsAffected && result.rowsAffected >= 1) {
            await conn.commit();
            await conn.release();
            req.flash('success', 'Usuario eliminado con exito');
            res.redirect(`/profesor/asignar/${id2}`);

        } else {
            await conn.release();
        }
    } catch (error) {
        console.log('Error al eliminar un usuario de un proyecto ', error)
    }
});


module.exports = router