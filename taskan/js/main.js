// Basic JavaScript for Taskan app
document.addEventListener('DOMContentLoaded', () => {
    console.log('Taskan app loaded');

    const form = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const todoContainer = document.querySelector('#todo-col .tasks-container');

    if (form && taskInput && todoContainer) { // Check if elements exist
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskText = taskInput.value.trim();
            if (taskText === '') {
                alert('Por favor, escribe una tarea.'); // Optional: provide user feedback
                return;
            }

            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.draggable = true;
            taskCard.id = `task-${Date.now()}`;
            taskCard.innerText = taskText; // Using innerText for security

            todoContainer.appendChild(taskCard);
            taskInput.value = '';

            // Añadir listeners de drag & drop a la nueva tarjeta
            addDragAndDropListeners(taskCard);
            saveState(); // Guardar estado después de añadir una tarea
        });
    } else {
        console.error('No se encontraron los elementos del formulario de tareas o el contenedor "Por Hacer". Asegúrate que los IDs y selectores son correctos en tu HTML.');
    }

    loadState(); // Cargar estado cuando el DOM esté listo
});

// Placeholder for drag and drop listeners
function addDragAndDropListeners(taskCard) {
    // console.log('Placeholder: addDragAndDropListeners for', taskCard.id);
    // Esta función se implementará en el siguiente paso.
    // Debería añadir event listeners para 'dragstart', 'dragend', etc.
}

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

// --- Persistencia de Datos ---

function saveState() {
    const state = {
        todo: [],
        inprogress: [],
        done: []
    };

    const todoCol = document.querySelector('#todo-col .tasks-container');
    const inprogressCol = document.querySelector('#inprogress-col .tasks-container');
    const doneCol = document.querySelector('#done-col .tasks-container');

    if (todoCol) {
        todoCol.querySelectorAll('.task-card').forEach(card => state.todo.push({ id: card.id, text: card.innerText }));
    }
    if (inprogressCol) {
        inprogressCol.querySelectorAll('.task-card').forEach(card => state.inprogress.push({ id: card.id, text: card.innerText }));
    }
    if (doneCol) {
        doneCol.querySelectorAll('.task-card').forEach(card => state.done.push({ id: card.id, text: card.innerText }));
    }

    localStorage.setItem('kanbanState', JSON.stringify(state));
    console.log('Estado guardado en localStorage:', state);
}

function loadState() {
    const state = JSON.parse(localStorage.getItem('kanbanState'));
    console.log('Estado cargado desde localStorage:', state);
    if (!state) return;

    const createTaskCardFromData = (taskData) => { // Renamed to avoid conflict if defined elsewhere
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.id = taskData.id;
        card.innerText = taskData.text; // Using innerText for security, as it was saved
        addDragAndDropListeners(card); // Asegúrate que esta función esté definida y funcione correctamente
        return card;
    };

    const todoContainer = document.querySelector('#todo-col .tasks-container');
    const inprogressContainer = document.querySelector('#inprogress-col .tasks-container');
    const doneContainer = document.querySelector('#done-col .tasks-container');

    if (todoContainer && state.todo) {
        state.todo.forEach(task => todoContainer.appendChild(createTaskCardFromData(task)));
    }
    if (inprogressContainer && state.inprogress) {
        state.inprogress.forEach(task => inprogressContainer.appendChild(createTaskCardFromData(task)));
    }
    if (doneContainer && state.done) {
        state.done.forEach(task => doneContainer.appendChild(createTaskCardFromData(task)));
    }
    console.log('Estado reconstruido en el DOM.');
}
