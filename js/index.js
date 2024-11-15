document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Envía los datos al servidor para la autenticación
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Credenciales incorrectas');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Guarda el idusuario y NombreyApellido en localStorage
            localStorage.setItem('idusuario', data.idusuario);
            localStorage.setItem('NombreyApellido', data.NombreyApellido);

            // Redirigir según el rol
            if (data.role === 'admin') {
                window.location.href = 'html/sesion.html'; // Redirigir a la página del admin
            } else {
                window.location.href = 'html/sesionusuario.html'; // Redirigir a la página del usuario
            }
        }
    })
    .catch(error => {
        alert(error.message); // Mostrar mensaje de error
    });
});
