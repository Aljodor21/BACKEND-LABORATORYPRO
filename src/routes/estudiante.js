const express = require('express');
const router = express.Router();

//Instancia de mi base de datos
const db = require('../database');

router.get('/', async (req, res) => {
    try {
        //const id = req.user[0];
        const id = 2;
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

router.get('/viewPE/:id', async (req, res) => {

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



        res.render('estudiante/viewPE', { layout: 'main2', proyecto })
    } catch (error) {
        console.log('Error al consultar un proyecto en especifico ', error)
    }

});

router.get('/avances', async (req, res) => {
    try {
        //const id = req.user[0];
        const id = 2;
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

router.get('/subirA/:idp/:idu/:av', async(req, res) => 
{
    try 
    {
        const {idp,idu,av} = req.params;
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM AVANCES WHERE CODIGO_PROYECTO=:ID ORDER BY ID_AVANCE',[idp]);

        if(result.rows.length > 0)
        {
            if(result.rows.length = 1)
            {

            }
        }
        res.render('estudiante/subir', { layout: 'main2',});
    } catch (error) 
    {
        
    }
    
});

module.exports = router