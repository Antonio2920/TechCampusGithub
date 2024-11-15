// Evento al cambiar el curso
document.getElementById('cursoSelect').addEventListener('change', function () {
    const cursoSeleccionado = this.value;
    const alumnoSelect = document.getElementById('alumnoSelect');
    alumnoSelect.innerHTML = '<option value="">--Seleccionar--</option>';

    if (cursoSeleccionado) {
        fetch(`/api/alumnos/${cursoSeleccionado}`) // Corregido aquí
            .then(response => response.json())
            .then(alumnos => {
                alumnos.forEach(alumno => {
                    const option = document.createElement('option');
                    option.value = alumno.id;
                    option.textContent = alumno.nombre;
                    alumnoSelect.appendChild(option);
                });
                
                alumnoSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error al cargar los alumnos:', error);
                alumnoSelect.disabled = true;
            });
    } else {
        alumnoSelect.disabled = true;
    }
});

document.getElementById('alumnoSelect').addEventListener('change', async function () {
    const alumnoSeleccionado = this.value;
    const tablaNotasContainer = document.getElementById('tablaNotasContainer');
    const notasBody = document.getElementById('notasBody');

    if (alumnoSeleccionado) {
        tablaNotasContainer.style.display = 'block';

        // Obtiene las materias y las notas
        fetch('/api/materias')
            .then(response => response.json())
            .then(async materias => {
                notasBody.innerHTML = ''; // Limpia la tabla
                for (const materia of materias) {
                    const row = document.createElement('tr');

                    const cellMateria = document.createElement('td');
                    cellMateria.textContent = materia.NombreMateria;
                    cellMateria.setAttribute('data-id', materia.idmateria);
                    row.appendChild(cellMateria);

                    // Fetch para obtener las notas de la materia y alumno específico
                    const notasResponse = await fetch(`/api/notas/${alumnoSeleccionado}/${materia.idmateria}`);
                    const notasData = await notasResponse.json();
                    const notas = notasData.length > 0 ? notasData[0] : {};

                    // Crea las celdas de notas
                    const fieldNames = ["Informe1", "Informe2", "Nota1", "Informe3", "Informe4", "Nota2", "NotaAnual", "NotaAcreditacion", "NotaRecuperatorio", "NotaDefinitiva"];
                    fieldNames.forEach(fieldName => {
                        const cellNota = document.createElement('td');
                        const inputNota = document.createElement('input');
                        inputNota.type = 'number';
                        inputNota.min = '1';
                        inputNota.max = '10';
                        inputNota.placeholder = fieldName;
                        inputNota.value = notas[fieldName] || ''; // Cargar la nota existente o dejar vacío
                        inputNota.setAttribute('data-field', fieldName);

                        // Limitar el valor entre 1 y 10
                        inputNota.addEventListener('input', () => {
                            if (inputNota.value < 1) inputNota.value = 1;
                            if (inputNota.value > 10) inputNota.value = 10;
                        });

                        cellNota.appendChild(inputNota);
                        row.appendChild(cellNota);
                    });

                    notasBody.appendChild(row);
                }
            })
            .catch(error => {
                console.error('Error al cargar las materias o notas:', error);
            });
    } else {
        tablaNotasContainer.style.display = 'none';
    }
});



// Guardar notas al hacer clic en el botón
document.getElementById('btnGuardarNotas').addEventListener('click', async () => {
    const alumnoId = document.getElementById('alumnoSelect').value;
    if (!alumnoId) {
        alert("Selecciona un alumno antes de guardar las notas.");
        return;
    }

    const notas = [];
    const filas = document.querySelectorAll('#notasBody tr');

    const fieldNames = ["informe1", "informe2", "Nota1", "informe3", "informe4", "Nota2", "NotaAnual", "NotaAcreditacion", "NotaRecuperatorio", "NotaDefinitiva"];

    filas.forEach(fila => {
        const materiaId = fila.querySelector('td[data-id]').getAttribute('data-id');
        const notaInputs = fila.querySelectorAll('input');

        const notaData = { Usuarios_idusuario: alumnoId, Materias_idmateria: materiaId };
        notaInputs.forEach((input, index) => {
            const fieldName = fieldNames[index];
            notaData[fieldName] = input.value ? parseInt(input.value, 10) : null;
        });

        notas.push(notaData);
    });

    console.log(notas); // Verifica los datos antes de enviar

    document.getElementById('btnGuardarNotas').disabled = true;
    try {
        const response = await fetch('/api/notas', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notas)
        });

        if (!response.ok) {
            throw new Error('Error al guardar las notas');
        }

        const data = await response.json();
        console.log(data); // Verifica la respuesta del servidor
        alert(data.message || 'Notas actualizadas correctamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar notas: ' + error.message);
    } finally {
        document.getElementById('btnGuardarNotas').disabled = false;
    }
});
