// Funcion para enviar los datos al backend en un json
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente
    enviarSolicitudAcceso(); // Llamar a la función enviarDatos
});

function enviarSolicitudAcceso() {
    console.log('Función enviarSolicitud llamada');
    username = document.getElementById('username').value;
    nombre = document.getElementById('nomCompleto').value;
    pass = document.getElementById('password').value;

    if (username == '' || nombre == '' || pass == '') {
        //alert('No hay items para enviar');
        Swal.fire({
            icon: 'warning',
            title: 'Datos incompletos!',
            text: 'Debe cargar todos los campos para poder solicitar el acceso.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: "#20512d"
            //timer: 5000 // El mensaje se cierra automáticamente en 3 segundos
        });
        return;
    }

    const data = {
        nombre: nombre,
        username: username,
        password: pass
    };

    console.log('Datos a enviar: ', data);

    fetch('/auth/save_request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            //alert('Datos guardados con éxito');
            Swal.fire({
                icon: 'success',
                title: 'Solicitud enviada con éxito!',
                text: 'Pronto un representante se pondrá en contacto con usted',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: "#20512d"
            }).then(() => {
                // Redirijo a la pantalla de login
                window.location.href = '/auth/login';
            });            
            
        } else {
            console.log('Error al guardar la orden: ' + data.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message,
                confirmButtonText: 'Intente de nuevo'
                
            });
        }
    })
    .catch(error => console.error('Error: ', error));    
}