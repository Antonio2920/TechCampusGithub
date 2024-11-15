window.addEventListener('DOMContentLoaded', function() {
    // Verificamos si existe el dato 'NombreyApellido' en localStorage
    const NombreyApellido = localStorage.getItem('NombreyApellido');
    
    // Imprime en consola para verificar el valor recuperado
    console.log('Nombre y apellido recuperado:', NombreyApellido);

    // Verificamos si el nombre y apellido están disponibles en localStorage
    if (NombreyApellido) {
        // Mostramos el nombre y apellido en el span con el ID 'userNameDisplay'
        document.getElementById('userNameDisplay').textContent = NombreyApellido;
    } else {
        // Si no se encuentra, redirigimos a la página de login
        console.log('No se encontró el nombre y apellido en localStorage');
        window.location.href = '../index.html';
    }
});


const idusuario = localStorage.getItem('idusuario');
const role = localStorage.getItem('role');

if (!idusuario) {
    window.location.href = '../index.html'; // Redirige a la página de login si no está logueado
} else {
    document.getElementById('tablaNotasContainer').style.display = 'block';

    console.log(`Consultando notas para el usuario ID: ${idusuario}`); // Verificación

    // Llamada a la API para obtener las notas del usuario
    fetch(`/api/notas/${idusuario}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }
        return response.json();
    })
    .then(data => {
        const notasBody = document.getElementById('notasBody');
        notasBody.innerHTML = ''; // Limpia la tabla

        // Recorrer las notas obtenidas
        data.forEach(nota => {
            const row = document.createElement('tr');

            const cellMateria = document.createElement('td');
            cellMateria.textContent = nota.NombreMateria || '-'; // Muestra el nombre de la materia
            row.appendChild(cellMateria);

            // Crea las celdas de notas
            const fieldNames = ["Informe1", "Informe2", "Nota1", "Informe3", "Informe4", "Nota2", "NotaAnual", "NotaAcreditacion", "NotaRecuperatorio", "NotaDefinitiva"];
            fieldNames.forEach(fieldName => {
                const cellNota = document.createElement('td');
                cellNota.textContent = nota[fieldName] || '-'; // Muestra la nota o un guion si no hay nota
                row.appendChild(cellNota);
            });

            notasBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error al cargar las notas:', error);
    });

}
