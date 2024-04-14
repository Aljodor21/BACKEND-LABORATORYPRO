const express = require('express');
const router = express.Router();

//2 FUNCIONES

router.get('/',(req,res)=>
{
    
    res.status(200).render('home/index')
});

router.get('/ayuda',(req,res)=>
{
    
    res.status(200).render('home/ayuda')
});

module.exports = router;