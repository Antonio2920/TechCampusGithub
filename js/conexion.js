const mysql = require("mysql2");

const cone = mysql.createConnection({
    host: '127.0.0.1',
    database: 'mydb',
    user: 'root',
    password: '338925antonio'
});

cone.connect(function(err) {
    if (err) {
        console.error("Error al conectar:", err);
        return;
    }
    console.log("Conexión Exitosa");

    module.exports = cone; 

});