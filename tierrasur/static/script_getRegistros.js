// Funcion de abrir y cerrar el sidebar
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

// Sidebar filtros
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar-filtros");
    const filterBtn = document.getElementById("btn_filtro");
    const apliFilters = document.getElementById("aplicar_filtros");
    const cancelFilters = document.getElementById("cancelar_filtros");

    // Mostrar/Ocultar el menú al hacer clic en el botón
    filterBtn.addEventListener("click", () => {
        sidebar.classList.toggle("active");
    });

    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener("click", (event) => {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnFilterButton = filterBtn.contains(event.target);
        const isClickOnFilterApliButton = apliFilters.contains(event.target);
        const isClickOnCancelApliButton = cancelFilters.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnFilterButton || isClickOnFilterApliButton || isClickOnCancelApliButton) {
            sidebar.classList.remove("active");
        }
    });
});

// Hago la peticion en la Pantalla de Mis Registros
document.addEventListener('DOMContentLoaded', function() {
    
    const btnExcel = document.getElementById('btnExcel');
    const [fecha1, fecha2] = obtener_dia()

    const requestFecha = new URLSearchParams(
        {
            fecha1: fecha1,
            fecha2: fecha2,
            nick_usuario: null
        }
    );

    fetch(`/api/get_registers?${requestFecha.toString()}`)
        .then(response => response.json()) // Parsear la respuesta como JSON
        .then(data => {
            if (data.success) {
                if (Object.keys(data.data).length === 0 && data.constructor === Object) {
                    imagenNoDatos()
                } else {
                    btnExcel.style.display = 'block';
                    contenedorRegistros(data.data)
                }                
                console.log('Entre al if del fetch')
            } else {
                console.log('Entre al else del fetch')
            }
            
        })
        .catch(error => console.error('Error:', error));
});

// Hago la peticion para recuperar los usuarios para los filtros
document.addEventListener('DOMContentLoaded', function() {
    
    const btnExcel = document.getElementById('btnExcel');
    const [hoy, hoy2] = obtener_diaISO()
    const fec1 = document.getElementById('start-date');
    const fec2 = document.getElementById('end-date');


    fetch(`/api/get_filters`)
        .then(response => response.json()) // Parsear la respuesta como JSON
        .then(data => {
            if (data.success) {
                crearElementosFiltro(data)
                fec1.value = hoy;
                fec2.value = hoy2;  
                console.log('Entre al if del fetch')
            } else {
                console.log('Entre al else del fetch')
            }
            
        })
        .catch(error => console.error('Error:', error));
});


// Funcion para el boton de filtros
function filtrar_registros() {
    
    const fec1 = document.getElementById('start-date').value;
    const fec2 = document.getElementById('end-date').value;

    console.log(`Las fechas antes de formatearlas son: fec1: ${fec1} y fec2: ${fec2}`);


    const fecha_inicial = formatearFecha(fec1)
    const fecha_final = formatearFecha(fec2)

    const divPrincipal = document.getElementById('conteinerRegisters');
    divPrincipal.innerHTML = '';

    const btnExcel = document.getElementById('btnExcel');
    btnExcel.style.display = 'none';

    
    const nick_check = document.querySelectorAll('input[type="checkbox"]:checked');
    if (nick_check.length === 0) {
        console.log(fecha_inicial);
        console.log(fecha_final);
        get_registros('null', fecha_inicial, fecha_final)
    } else {
        nick_check.forEach(checkbox => {
            const check_value = checkbox.value // Para obtener el valor del checkbox seleccionado
    
            console.log(check_value);
            console.log(fecha_inicial);
            console.log(fecha_final);
    
            
            get_registros(check_value, fecha_inicial, fecha_final)
            
    
        })
    }
    
}

// Funcion que hace la petición a los registros
function get_registros(nick_usuario, fecha1, fecha2) {
    const requestParameters = new URLSearchParams(
        {
            fecha1: fecha1,
            fecha2: fecha2,
            nick_usuario: nick_usuario
        });
    
    fetch(`/api/get_registers?${requestParameters.toString()}`)
        .then(response => response.json()) // Parsear la respuesta como JSON
        .then(data => {
            if (data.success) {
                if (Object.keys(data.data).length === 0 && data.constructor === Object) {
                    imagenNoDatos()
                } else {
                    btnExcel.style.display = 'block';
                    contenedorRegistros(data.data)
                }                
                console.log('Entre al if del fetch')
            } else {
                console.log('Entre al else del fetch')
            }
            
        })
        .catch(error => console.error('Error:', error));
}

// Funcion para crear los elementos del filtro
function crearElementosFiltro(data) {
    const divContenedor = document.getElementById('checks');
    
    data.data.forEach(data => {
        
        const div = document.createElement('div');
        div.classList.add('checkbox-wrapper');
        
        // Crear un nuevo checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = data.nick;
        checkbox.name = 'singleCheckbox';
        checkbox.value = data.nick;

        // Crear una etiqueta para el checkbox
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.innerText = data.nick;

        

        // Agregar un evento para que solo uno esté seleccionado
        checkbox.addEventListener('change', function() {
            // Obtener todos los checkboxes del grupo
            const checkboxes = document.querySelectorAll('input[name="singleCheckbox"]');
            checkboxes.forEach(cb => {
                // Deseleccionar los demás checkboxes si uno está seleccionado
                if (cb !== this) {
                    cb.checked = false;
                }
            });
        });

        // Agregar el checkbox y la etiqueta al contenedor
        div.appendChild(checkbox);
        div.appendChild(label);

        //divContenedor.appendChild(document.createElement('br')); // Salto de línea

        divContenedor.appendChild(div)
    });

}

// Función para descarga un excel con los registros
function descarga_excel() {
    const fec1 = document.getElementById('start-date').value;
    const fec2 = document.getElementById('end-date').value;
    let nick_usuario = 'null';
    const nick_check = document.querySelectorAll('input[type="checkbox"]:checked');
    if (nick_check.length != 0) {
        nick_check.forEach(checkbox => {
            const check_value = checkbox.value // Para obtener el valor del checkbox seleccionado 
            
            nick_usuario = check_value;
            
    
        })
    }
    console.log(`Las fechas antes de formatearlas son: fec1: ${fec1} y fec2: ${fec2} y el usuario elegido es ${nick_usuario}`);


    const fecha_inicial = formatearFecha(fec1)
    const fecha_final = formatearFecha(fec2)

    const [hoy, mañana] = obtener_dia()

    const requestFecha = new URLSearchParams(
        {
            fecha1: fecha_inicial,
            fecha2: fecha_final,
            nick_usuario: nick_usuario
        }
    );

    fetch(`/api/download_excel?${requestFecha.toString()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al descargar el archivo');
            }
            return response.blob();
        })
        .then(blob => {
            // Crear una URL para el blob y descargar el archivo
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registros_${hoy}.xlsx`;  // Nombre con el que se descargará el archivo
            document.body.appendChild(a);
            a.click();  // Simular el clic para descargar
            a.remove();  // Remover el elemento del DOM
        })
        .catch(error => {
            console.log('Error: ', error);
        });
    
}

// Funcion para obtener el dia de la fecha
function obtener_dia() {
    const hoy = new Date();

    // Obtener el año, mes y día
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan en 0, por eso sumamos 1
    const day = hoy.getDate().toString().padStart(2, '0'); // El día del mes

    const fecha1 = `${day}/${month}/${year}`;

    const year2 = hoy.getFullYear();
    const month2 = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan en 0, por eso sumamos 1
    const day2 = (hoy.getDate() + 1).toString().padStart(2, '0');

    const fecha2 = `${day2}/${month2}/${year2}`;

    return [fecha1, fecha2];
    
};

// Funcion para obtener el dia de la fecha
function obtener_diaISO() {
    const hoy = new Date();

    // Obtener el año, mes y día
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan en 0, por eso sumamos 1
    const day = hoy.getDate().toString().padStart(2, '0'); // El día del mes

    const fecha1 = `${year}-${month}-${day}`;

    const year2 = hoy.getFullYear();
    const month2 = (hoy.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan en 0, por eso sumamos 1
    const day2 = (hoy.getDate() + 1).toString().padStart(2, '0');

    const fecha2 = `${year2}-${month2}-${day2}`;

    return [fecha1, fecha2];
    
};

// Funcion para crear las vistas de los registros
function crearContenedorRegistros(data) {
    // Formateo la fecha que devuelve el backend
    const fec = formatearFechaCard(data.fecha)
    
    // Creo el contenedor principal
    const contenedor = document.createElement('div');
    contenedor.classList.add('carta');

    // Creo los elementos que van dentro
    const tituloPrincipal = document.createElement('h4');
    tituloPrincipal.classList.add('carta-header');
    tituloPrincipal.innerHTML = `Campaña ${data.campania} <span>${data.nro_c}</span>`;

    // Unidad productiva
    const uniProd = document.createElement('p');
    uniProd.innerHTML = `<b>UP:</b> ${data.up}`;
    
    // Lote
    const lote = document.createElement('p');
    lote.innerHTML = `<b>Lote:</b> ${data.lote}`;

    // Actividad
    const actividad = document.createElement('p');
    actividad.innerHTML = `<b>Actividad:</b> ${data.actividad}`;

    // Codigo
    const codigo = document.createElement('p');
    codigo.innerHTML = `<b>Tipo:</b> ${data.codigo}`;

    // Detalle
    const detalle = document.createElement('p');
    detalle.innerHTML = `<b>Insumo:</b> ${data.detalle}`;

    // Fecha
    const fecha = document.createElement('p');
    fecha.innerHTML = `<b>Fecha:</b> ${fec}`;

    // Fecha
    const cant = document.createElement('p');
    cant.innerHTML = `<b>Cantidad:</b> ${data.cantidad}`;

    // Fecha
    const usuario = document.createElement('p');
    usuario.innerHTML = `<b>Usuario:</b> ${data.usuario}`;

    // Agrego los elementos al contenedor principal
    contenedor.appendChild(tituloPrincipal);
    contenedor.appendChild(uniProd);
    contenedor.appendChild(lote);
    contenedor.appendChild(actividad);
    contenedor.appendChild(codigo);
    contenedor.appendChild(detalle);
    contenedor.appendChild(cant);
    contenedor.appendChild(fecha);
    contenedor.appendChild(usuario);

    // Inserto el contenido en el DOM
    document.getElementById('conteinerRegisters').appendChild(contenedor);
}

// Funcion para manejar registros múltiples
function contenedorRegistros(registros) {
    const contenedor = document.getElementById('conteinerRegisters');
    contenedor.innerHTML = '';

    // Recorro el array de registros
    registros.forEach(registro => {
        crearContenedorRegistros(registro);
    });
}

function imagenNoDatos() {
    const contenedor = document.getElementById('conteinerRegisters');
    
    const div_img = document.createElement('div');
    div_img.classList.add('div-img');

    const img = document.createElement('img');
    img.src = '/static/images/no_data.png';
    img.alt = 'No se encontraron datos.';
    
    div_img.appendChild(img);
    contenedor.appendChild(div_img);
}

// Funcion para formatear la fecha
function formatearFecha(fechaString) {
    // Creo un objeto Date con el string recibido
    const fecha = new Date(fechaString +'T00:00:00');
  
    // Obtengo el día, mes y año
    const dia = fecha.getDate().toString().padStart(2, '0'); // Asegurar dos dígitos
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11, por eso sumamos 1
    const año = fecha.getFullYear();
  
    // Formateo la fecha como dd/mm/yyyy
    return `${dia}/${mes}/${año}`;
  }

  // Funcion para formatear la fecha
function formatearFechaCard(fechaString) {
    // Creo un objeto Date con el string recibido
    const fecha = new Date(fechaString);
  
    // Obtengo el día, mes y año
    const dia = fecha.getDate().toString().padStart(2, '0'); // Asegurar dos dígitos
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11, por eso sumamos 1
    const año = fecha.getFullYear();
  
    // Formateo la fecha como dd/mm/yyyy
    return `${dia}/${mes}/${año}`;
  }

  // Funcion para formatear la fecha
function formatearFechaISO(fechaString) {
    // Creo un objeto Date con el string recibido
    const fecha = new Date(fechaString + 'T00:00:00');
  
    // Obtengo el día, mes y año
    const dia = fecha.getDate().toString().padStart(2, '0'); // Asegurar dos dígitos
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11, por eso sumamos 1
    const año = fecha.getFullYear();
  
    // Formateo la fecha como dd/mm/yyyy
    return `${año}-${mes}-${dia}`;
  }