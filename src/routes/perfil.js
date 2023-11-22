const express = require('express');
const router = express.Router();

//Instancia de la base de datos
const db = require('../database');

router.get('/', async (req, res) => 
{
    
    try 
    {
        const pool = await db.iniciar();
        const conn = await pool.getConnection();

        const result = await conn.execute('SELECT * FROM TIPOS WHERE ID_TIPO=:ID',[req.user[7]]);

        const data = result.rows[0][1];
        
        res.render('perfil/perfil',{data});
    } catch (error) 
    {
        console.log('Error al consultar el tipo de usuario ' , error)
    }
});

module.exports = router;