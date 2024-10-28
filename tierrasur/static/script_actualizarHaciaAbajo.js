let startY = 0;
let isPulling = false;
const threshold = 100; // Umbral para actualizar (en píxeles)
const refreshMessage = document.createElement('div');
refreshMessage.id = "refreshMessage";
refreshMessage.innerText = "Refrescando...";
refreshMessage.style.display = "none";
refreshMessage.style.position = "fixed";
refreshMessage.style.width = "100%";
refreshMessage.style.top = "0";
refreshMessage.style.textAlign = "center";
refreshMessage.style.backgroundColor = "#f0f0f0";
refreshMessage.style.padding = "10px";
document.body.prepend(refreshMessage);

// Detectar el inicio del toque
window.addEventListener('touchstart', function (e) {
  if (window.scrollY === 0) { // Solo detecta cuando estamos en el tope de la página
    startY = e.touches[0].clientY;
    isPulling = true;
  }
});

// Detectar el movimiento hacia abajo
window.addEventListener('touchmove', function (e) {
  if (isPulling) {
    const currentY = e.touches[0].clientY;
    const diffY = currentY - startY;

    if (diffY > threshold) { // Si se supera el umbral
      refreshMessage.style.display = "block"; // Mostrar el mensaje de refresco
      window.scrollTo(0, 0); // Evitar que la página se desplace
    }
  }
});

// Detectar cuando el usuario deja de tocar la pantalla
window.addEventListener('touchend', function () {
  if (isPulling) {
    refreshMessage.style.display = "none"; // Ocultar el mensaje
    isPulling = false;
    location.reload(); // Recargar la página para actualizar el contenido
  }
});
