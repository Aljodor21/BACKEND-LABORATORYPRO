const app = require('./src/index')

//Inicializacion de mi servidor
app.listen(app.get('port'), (req) => {
    console.log(`Servidor en el puerto ${app.get('port')}`);
    
})