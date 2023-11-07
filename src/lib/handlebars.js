const moment = require('moment');

const helpers = {};

helpers.timeago = (timeStamp) => {

    return moment(timeStamp).format('DD-MM-YYYY')
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