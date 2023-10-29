const oracle = require('oracledb');
const {database} =require('./keys');

async function iniciar(){
    

    try{
        const pool = await oracle.createPool(database);
        console.log('DB esta conectada');
        return pool;

    }catch(error){
        console.log('Error en la conexión de la DB ',error)
    }

}

module.exports ={
    iniciar:iniciar
};
