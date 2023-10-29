const express = require('express');
const router = express.Router();

//Instancia de la BD para realizar las diferentes consultas
const db=require('../database');


router.get("/",async (req,res)=>{
    res.render('profesor/profesor',{layout:'main2'})
    
});

router.get("/proyectos",(req,res)=>{
    res.render('profesor/proyectos',{layout:'main2'})
});

router.get("/viewPP",(req,res)=>{
    res.render('profesor/viewPP',{layout:'main2'})
})
module.exports = router