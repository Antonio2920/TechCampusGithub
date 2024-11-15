const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Configura el servidor para leer JSON
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Cambia esto por el dominio que necesites
    methods: ['GET', 'POST', 'PUT']
  }));

// Servir archivos estáticos desde el directorio 'html'
app.use(express.static(path.join(__dirname)));

// Configura la conexión a la base de datos
const cone = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '338925antonio',
    database: 'mydb'
});

// Conexión a la base de datos
cone.connect((err) => {
    if (err) {
        console.error("Error al conectar:", err);
        return;
    }
    console.log("Conexión Exitosa");
});

// Ruta para agregar un nuevo usuario
app.post('/api/usuarios', (req, res) => {
    const { curso, nombre, username, password } = req.body;
    const query = "INSERT INTO usuarios (id_Cursodivision, NombreyApellido, Usuarios, Contraseña, Admin) VALUES (?, ?, ?, ?, 0)";
    const values = [curso, nombre, username, password];

    cone.query(query, values, (error, result) => {
        if (error) {
            return res.status(500).json({ error: "Error al insertar usuario" });
        }
        res.json({ message: "Alumno ingresado correctamente" });
    });
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM usuarios WHERE Usuarios = ? AND Contraseña = ?";

    cone.query(query, [username, password], (error, results) => {
        if (error) {
            return res.status(500).json({ error: "Error al verificar las credenciales" });
        }

        if (results.length > 0) {
            const user = results[0];  // Primero obtienes el primer usuario que coincide
            res.json({ 
                success: true, 
                role: user.Admin ? 'admin' : 'usuario',
                idusuario: user.idusuario,
                NombreyApellido: user.NombreyApellido
            });
        } else {
            res.status(401).json({ success: false, message: "Credenciales incorrectas" });
        }
    });
});


app.get('/api/notas', (req, res) => {
    const query = "SELECT * FROM notas"; // Ajusta el nombre de la tabla según sea necesario

    cone.query(query, (error, result) => {
        if (error) {
            return res.status(500).json({ error: "Error al obtener las notas" });
        }

        res.json(result); // Enviar las notas como respuesta
    });
});

// Ruta para actualizar notas
app.put('/api/notas', (req, res) => {
    const notas = req.body;

    // Array para almacenar los resultados o errores de cada operación
    const resultados = [];

    // Usamos Promise.all para ejecutar cada inserción/actualización como una promesa
    Promise.all(notas.map((nota, index) => {
        const query = `INSERT INTO notas (Usuarios_idusuario, Materias_idmateria, informe1, informe2, Nota1, informe3, informe4, Nota2, NotaAnual, NotaAcreditacion, NotaRecuperatorio, NotaDefinitiva)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                       ON DUPLICATE KEY UPDATE 
                       informe1 = VALUES(informe1), informe2 = VALUES(informe2), Nota1 = VALUES(Nota1), informe3 = VALUES(informe3), 
                       informe4 = VALUES(informe4), Nota2 = VALUES(Nota2), NotaAnual = VALUES(NotaAnual), NotaAcreditacion = VALUES(NotaAcreditacion), 
                       NotaRecuperatorio = VALUES(NotaRecuperatorio), NotaDefinitiva = VALUES(NotaDefinitiva)`;

        const values = [
            nota.Usuarios_idusuario, nota.Materias_idmateria,
            nota.informe1, nota.informe2, nota.Nota1, nota.informe3,
            nota.informe4, nota.Nota2, nota.NotaAnual, nota.NotaAcreditacion,
            nota.NotaRecuperatorio, nota.NotaDefinitiva
        ];

        // Ejecutamos la consulta y manejamos cada nota individualmente
        return new Promise((resolve, reject) => {
            cone.query(query, values, (error, result) => {
                if (error) {
                    resultados.push({
                        status: 'error',
                        index: index + 1,
                        usuario: nota.Usuarios_idusuario,
                        materia: nota.Materias_idmateria,
                        error: error.message
                    });
                    reject(error); // Rechaza la promesa con el error
                } else {
                    resultados.push({
                        status: 'success',
                        index: index + 1,
                        usuario: nota.Usuarios_idusuario,
                        materia: nota.Materias_idmateria,
                        affectedRows: result.affectedRows
                    });
                    resolve(result); // Resuelve la promesa si es exitoso
                }
            });
        });
    }))
    .then(() => {
        // Responde con el array de resultados que indica el éxito o error de cada inserción
        res.json({ message: "Proceso completado", resultados: resultados });
    })
    .catch(error => {
        // Si alguna promesa falla, responde con un error detallado
        res.status(500).json({
            error: "Error al procesar algunas notas",
            resultados: resultados
        });
    });
});

// Ruta para obtener alumnos de un curso específico
app.get('/api/alumnos/:curso', (req, res) => {
    const curso = req.params.curso;

    const query = "SELECT idusuario AS id, NombreyApellido AS nombre FROM usuarios WHERE id_Cursodivision = ?";
    cone.query(query, [curso], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});

// Ruta para obtener las materias
app.get('/api/materias', (req, res) => {
    const query = "SELECT idmateria, NombreMateria FROM materias";

    cone.query(query, (error, results) => {
        if (error) {
            console.error("Error al obtener materias:", error);
            return res.status(500).json({ error: "Error al obtener materias" });
        }
        res.json(results);
    });
});

// Ruta para obtener notas de un alumno específico y una materia específica
app.get('/api/notas/:idusuario/:idmateria', (req, res) => {
    const { idusuario, idmateria } = req.params;
    const query = "SELECT * FROM notas WHERE Usuarios_idusuario = ? AND Materias_idmateria = ?";

    cone.query(query, [idusuario, idmateria], (error, results) => {  // Cambia `cone` a `conexion` si es necesario
        if (error) {
            console.error("Error al obtener notas:", error);
            return res.status(500).json({ error: "Error al obtener notas" });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron notas para el usuario y materia especificados." });
        }

        res.json(results);
    });
});

// Ruta para obtener las notas de un usuario específico
app.get('/api/notas/:idusuario', (req, res) => {
    const { idusuario } = req.params;
    const query = `
        SELECT n.*, m.NombreMateria 
        FROM notas n 
        JOIN materias m ON n.Materias_idmateria = m.idmateria 
        WHERE n.Usuarios_idusuario = ?`;

    cone.query(query, [idusuario], (error, results) => {
        if (error) {
            console.error("Error al obtener notas:", error);
            return res.status(500).json({ error: "Error al obtener notas" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No se encontraron notas para el usuario especificado." });
        }

        res.json(results);
    });
});



// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://127.0.0.1:${port}`);
});
