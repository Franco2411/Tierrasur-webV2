document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-toggle");

    // Mostrar/Ocultar el menú al hacer clic en el botón
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener("click", (event) => {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMenuButton = menuBtn.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnMenuButton) {
            sidebar.classList.remove("active");
        }
    });
});


document.getElementById('campos_list').addEventListener('change', function() {
    let campos_id = this.value;
    
    // Limpiar la segunda lista antes de llenarla
    let segundaLista = document.getElementById('segunda-lista');
    segundaLista.innerHTML = '<option value="">Seleccione una opción</option>';
    
    if (campos_id) {
        fetch(`/combo_lotes?campos_id=${campos_id}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                let option = document.createElement('option');
                option.value = item['numlot'];
                option.textContent = `${item['numlot']} - ${item['tipsue']}`;
                segundaLista.appendChild(option);
            });
        });
    }
});

document.getElementById('tablas').addEventListener('change', function() {
    let tabla_id = this.value;
    
    // Limpiar la segunda lista antes de llenarla
    let insumoList = document.getElementById('insumo_labor');
    insumoList.innerHTML = '<option value="">Seleccione una opción</option>';
    
    if (tabla_id) {
        fetch(`/combo_insumo_labor?tabla_id=${tabla_id}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(item => {
                let option = document.createElement('option');
                option.value = item['id1'];
                option.textContent = item['nombre'];
                insumoList.appendChild(option);
            });
        });
    }
});

document.getElementById('btn_enviar_orden').style.display = 'none';

// Funcion de adición de items a la lista de la orden
document.getElementById('openFormButton').addEventListener('click', function() {
    document.getElementById('popupForm').style.display = 'flex';
});

document.getElementById('closeFormButton').addEventListener('click', function() {
    document.getElementById('popupForm').style.display = 'none';
});


let items = [];
// Agrego los items a la lista y los muestro en la pantalla
function addItem() {
    // UP
    const upSelect = document.getElementById('campos_list');
    const up_name = upSelect.options[upSelect.selectedIndex].text;

    // Lote
    const loteSelect = document.getElementById('segunda-lista');
    const lote_name = loteSelect.options[loteSelect.selectedIndex].text;

    // Actividad
    const actividadSelect = document.getElementById('actividad_list');
    const actividad_name = actividadSelect.options[actividadSelect.selectedIndex].text;

    // Tablas
    const tablasSelect = document.getElementById('tablas');
    const tablas_name = tablasSelect.options[tablasSelect.selectedIndex].text;

    // Insumos
    const insumoSelect = document.getElementById('insumo_labor');
    const insumo_name = insumoSelect.options[insumoSelect.selectedIndex].text;
    
    const quantity = document.getElementById('cantidad').value;

    // Depositos
    const deposito_select = document.getElementById('deposito');
    const deposito = deposito_select.options[deposito_select.selectedIndex].text;

    if (quantity == '' || up_name == 'Seleccione una opción' || lote_name == 'Seleccione una opción') {
        alert("Los campos UP, Lote y Cantidad no pueden estar vacíos.");
        return;
    }

    // Agregamos el item al array
    items.push({
        up: parseInt(up_name),
        lote: parseInt(lote_name),
        actividad: actividad_name,
        tipo: tablas_name,
        insumo: insumo_name,
        cant: parseFloat(quantity),
        deposito: deposito
    });

    renderItems();
   

    // Limpiar los campos de entrada después de agregar el ítem
    document.getElementById('cantidad').value = '';
    //document.getElementById('deposito').value = '';
    //document.getElementById('popupForm').style.display = 'none';

    // Muestro el boton de enviar orden
    document.getElementById('btn_enviar_orden').style.display = 'block';
}

// Función para renderizar los items en la lista
function renderItems() {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = ''; // Limpiamos la lista

    items.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `UP: ${item.up} - Lote: ${item.lote} - Actividad: ${item.actividad} - Tipo: ${item.tipo} - Insumo/Labor: ${item.insumo} - Cantidad: ${item.cant} - Deposito: ${item.deposito}`;
        itemList.appendChild(listItem);
    });

    /*items.forEach((item, index) => {
        const listItem = document.createElement('li');
        const divItem = document.createElement('div');

        divItem.innerHTML = `
            <h4>UP: ${item.up}</h4>
            <p>Lote: ${item.lote}</p>
            <p>Actividad: ${item.actividad}</p>
            <p>Tipo: ${item.tipo}</p>
            <p>Insumo/Labor: ${item.insumo}</p>
            <p>Cantidad: ${item.cant}</p>
            <p>Precio: ${item.precio}</p>
        `;

        listItem.appendChild(divItem);
        itemList.appendChild(listItem);
    });*/
    
}

// Funcion para enviar los datos al backend en un json
document.getElementById('submitForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente
    Swal.fire({
        title: "¿Está seguro?",
        text: "Está por enviar una orden, asegurese de que los datos estén correctos",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#20512d",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, enviar orden"
      }).then((result) => {
        if (result.isConfirmed) {
          enviarDatos()
        }
      });
    
    
    //enviarDatos(); // Llamar a la función enviarDatos
});

function enviarDatos() {
    console.log('Función enviarDatos llamada');
    if (items.length === 0) {
        //alert('No hay items para enviar');
        Swal.fire({
            icon: 'warning',
            title: 'No hay datos!',
            text: 'Debe cargar datos para poder enviarlos',
            confirmButtonText: 'Aceptar',
            //timer: 5000 // El mensaje se cierra automáticamente en 3 segundos
        });
        return;
    }

    const data = {
        order_id: document.getElementById('order-id') ? document.getElementById('order-id').value : null,
        items: items
    };

    console.log('Datos a enviar: ', data);

    fetch('/api/save_data', {
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
                title: 'Datos enviados!',
                text: 'Los datos se enviaron correctamente.',
                confirmButtonText: 'Aceptar',
                //timer: 5000 // El mensaje se cierra automáticamente en 3 segundos
            }).then(() => {
                const itemList = document.getElementById('item-list');
                itemList.innerHTML = ''; // Limpiamos la lista
                items.length = 0;

                // Oculto el boton de enviar orden
                document.getElementById('btn_enviar_orden').style.display = 'none';
            });            
            
        } else {
            console.log('Error al guardar la orden: ' + data.error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un problema al enviar los datos.',
                confirmButtonText: 'Intentar de nuevo'
            });
        }
    })
    .catch(error => console.error('Error: ', error));    
}



