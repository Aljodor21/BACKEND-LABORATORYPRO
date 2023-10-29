const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    res.render('estudiante/estudiante',{layout:'main2'});
});

router.get('/viewPE',(req,res)=>{
    res.render('estudiante/viewPE',{layout:'main2'});
});

router.get('/avances',(req,res)=>{
    res.render('estudiante/avances',{layout:'main2'});
});

router.get('/subirA',(req,res)=>{
    res.render('estudiante/subir',{layout:'main2'});
});

module.exports = router