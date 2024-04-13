//Modulos necesarios para mi proyecto
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');


//Inicializaciones
const app = express();
require('./controllers/passport');

//Configuraciones del servidor
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./controllers/handlebars')
}));
app.set('view engine', '.hbs');

//Puntos medio o middlewares
app.use(session({
    secret: 'laboratorypro-session',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Variables globales
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.successf = req.flash('successf');
    app.locals.user = req.user;
    next();
})

//Rutas
app.use(require('./models/index'));
app.use("/login", require('./models/login'));
app.use("/admin", require('./models/admin'));
app.use("/estudiante", require('./models/estudiante'));
app.use("/profesor", require('./models/profesor'));
app.use('/perfil', require('./models/perfil'));

//Archivos publicos de mi servidor
app.use(express.static(path.join(__dirname, 'public')));

//Inicializacion de mi servidor
app.listen(app.get('port'), (req) => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
    
})