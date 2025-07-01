// Basic JavaScript for Taskan app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Taskan app loaded');
});

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') // Asegúrate que la ruta a sw.js sea correcta desde la raíz
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
} else {
    console.log('Los Service Workers no son soportados en este navegador.');
}

// Aquí puedes añadir más lógica de tu aplicación en el futuro.
// console.log("App.js cargado."); // Comentado o eliminado si main.js es el punto de entrada principal.
