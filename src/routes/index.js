const express = require('express');
const router = express.Router();

//Instancia de la base de datos
const db = require('../database');

router.get('/',async (req,res)=>{
    res.render('home/index')
});

router.get('/ayuda',async (req,res)=>{
    
    res.render('home/ayuda')
});

module.exports = router;