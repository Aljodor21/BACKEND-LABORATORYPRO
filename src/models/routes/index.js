const express = require('express');
const router = express.Router();


router.get('/',(req,res)=>
{
    
    res.status(200).render('home/index')
});

router.get('/ayuda',(req,res)=>
{
    
    res.status(200).render('home/ayuda')
});

module.exports = router;