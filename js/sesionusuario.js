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
