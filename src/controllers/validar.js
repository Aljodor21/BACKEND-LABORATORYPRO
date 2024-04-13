module.exports = 
{

    isLoggedIn(req,res,next)
    {
        if(req.isAuthenticated())
        {
            return next()
        }
        return res.redirect('/login');
    },
    isNotLoggeIn(req,res,next)
    {
        if(!req.isAuthenticated())
        {
            return next()
        }
        return res.redirect('/perfil');
    },
    isAdmin(req,res,next)
    {
        if(req.user[7] == 1)
        {
            return next();
            
            
        }
        return res.redirect('/perfil');
    },
    isStudent(req,res,next)
    {
        if(req.user[7] == 2)
        {
            return next();
            
        }
        return res.redirect('/perfil');
    },
    isProfe(req,res,next)
    {
        if(req.user[7] == 3)
        {
            return next();
            
        }
        return res.redirect('/perfil');
    }
}