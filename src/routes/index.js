const express = require('express');
const router = express.Router();


router.get('/',async (req,res)=>{
    res.render('home/index')
});

router.get('/ayuda',async (req,res)=>{
    
    res.render('home/ayuda')
});

module.exports = router;