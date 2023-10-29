const moment = require('moment');

const helpers = {};

helpers.timeago = (timeStamp) => {

    return moment(timeStamp).format('DD-MM-YYYY')
};

helpers.tipo = (tipo) => {
    switch (tipo) {
        case 1:
            return "Administrador";
            break;
        case 2:
            return "Estudiante";
            break;
        case 3:
            return "Profesor";
            break;
    }
};

helpers.estado = (estado) => {
    switch (estado) {
        case 1:
            return "Pendiente";
            break;
        case 2:
            return "Activo";
            break;
        case 3:
            return "Rechazado";
            break;
    }
};

helpers.admin = (tipo)=>{

    if(tipo == 1){
        return true;
    }else{
        return false;
    }

}

helpers.estudiante = (tipo)=>{

    if(tipo == 2){
        return true;
    }else{
        return false;
    }

}

helpers.profesor = (tipo)=>{

    if(tipo == 3){
        return true;
    }else{
        return false;
    }

}

module.exports = helpers;