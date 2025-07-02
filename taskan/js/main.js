// Basic JavaScript for Taskan app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DEBUG: DOMContentLoaded event fired.');

    const form = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const todoContainer = document.querySelector('#todo-col .tasks-container');

    if (form && taskInput && todoContainer) {
        console.log('DEBUG: Form, taskInput, and todoContainer found.');
        form.addEventListener('submit', (e) => {
            console.log('DEBUG: Form submit event fired.');
            e.preventDefault();

            const currentTaskTextInForm = taskInput.value.trim(); // Renamed variable
            console.log('DEBUG: Task text from input:', currentTaskTextInForm);

            if (currentTaskTextInForm === '') {
                alert('Por favor, escribe una tarea.');
                return;
            }

            const newTaskData = { id: `task-${Date.now()}`, text: currentTaskTextInForm }; // Use renamed variable
            console.log('DEBUG: New task data for createTaskElement:', newTaskData);

            const newCardElement = createTaskElement(newTaskData);
            console.log('DEBUG: Task card element created by createTaskElement:', newCardElement);

            if (newCardElement) {
                todoContainer.appendChild(newCardElement);
                console.log('DEBUG: New task card appended to todoContainer.');
            } else {
                console.error('DEBUG: createTaskElement did not return a card.');
            }

            taskInput.value = '';
            saveState();
        });
    } else {
        console.error('DEBUG: Form, taskInput, or todoContainer NOT found. Check HTML IDs and selectors.');
    }

    loadState(); // Cargar estado cuando el DOM esté listo
});

// Placeholder for drag and drop listeners
function addDragAndDropListeners(taskCard) {
    // console.log('Placeholder: addDragAndDropListeners for', taskCard.id);
    // Esta función se implementará en el siguiente paso.
    // Debería añadir event listeners para 'dragstart', 'dragend', etc.
    // For now, it will also handle action button listeners
    addDeleteListener(taskCard);
    addDuplicateListener(taskCard);
    addEditListener(taskCard); // Placeholder
}

// --- Task Action Event Listeners (to be defined more fully) ---
function addDeleteListener(taskCard) {
    const deleteButton = taskCard.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                taskCard.remove();
                saveState();
            }
        });
    }
}

function addDuplicateListener(taskCard) {
    const duplicateButton = taskCard.querySelector('.duplicate-btn');
    if (duplicateButton) {
        duplicateButton.addEventListener('click', () => {
            const originalText = taskCard.querySelector('.task-text').innerText;
            const newTaskData = {
                id: `task-${Date.now()}`, // New unique ID
                text: originalText // Same text content
            };

            const newCard = createTaskElement(newTaskData); // Creates the new card with all buttons and listeners

            // Insert the new card after the original one in the same column
            taskCard.parentNode.insertBefore(newCard, taskCard.nextSibling);

            saveState(); // Save the new state
        });
    }
}

function addEditListener(taskCard) {
    const editButton = taskCard.querySelector('.edit-btn');
    const taskTextSpan = taskCard.querySelector('.task-text');
    const actionsDiv = taskCard.querySelector('.task-actions');

    if (editButton && taskTextSpan && actionsDiv) {
        editButton.addEventListener('click', () => {
            // Store original text and hide text span & action buttons
            const originalText = taskTextSpan.innerText;
            taskTextSpan.style.display = 'none';
            actionsDiv.style.display = 'none';

            // Create input field
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.className = 'edit-input'; // From CSS
            inputField.value = originalText;

            // Create Save button
            const saveButton = document.createElement('button');
            saveButton.className = 'action-btn save-edit-btn'; // From CSS
            saveButton.innerText = 'Guardar';

            // Create Cancel button
            const cancelButton = document.createElement('button');
            cancelButton.className = 'action-btn cancel-edit-btn'; // From CSS
            cancelButton.innerText = 'Cancelar';

            // Insert input and buttons before the (now hidden) actionsDiv
            taskCard.insertBefore(inputField, actionsDiv);
            taskCard.insertBefore(saveButton, actionsDiv);
            taskCard.insertBefore(cancelButton, actionsDiv);

            inputField.focus(); // Focus on the input field

            // --- Save Edit Listener ---
            saveButton.addEventListener('click', () => {
                const newText = inputField.value.trim();
                if (newText) {
                    taskTextSpan.innerText = newText;
                }
                // Restore display
                taskTextSpan.style.display = '';
                actionsDiv.style.display = '';
                inputField.remove();
                saveButton.remove();
                cancelButton.remove();
                if (newText) { // Only save if text is not empty, otherwise it's like a cancel if cleared
                    saveState();
                }
            });

            // --- Cancel Edit Listener ---
            cancelButton.addEventListener('click', () => {
                // Restore display without saving
                taskTextSpan.style.display = '';
                actionsDiv.style.display = '';
                inputField.remove();
                saveButton.remove();
                cancelButton.remove();
            });
        });
    }
}


function createTaskElement(taskData) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.id = taskData.id;

    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.innerText = taskData.text;
    card.appendChild(textSpan);

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'action-btn edit-btn';
    editButton.innerText = 'Editar';
    actionsContainer.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-btn delete-btn';
    deleteButton.innerText = 'Eliminar';
    actionsContainer.appendChild(deleteButton);

    const duplicateButton = document.createElement('button');
    duplicateButton.className = 'action-btn duplicate-btn';
    duplicateButton.innerText = 'Duplicar';
    actionsContainer.appendChild(duplicateButton);

    card.appendChild(actionsContainer);

    addDragAndDropListeners(card); // This will now also attach action listeners via the modified function
    return card;
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
        todoCol.querySelectorAll('.task-card').forEach(card => {
            const textSpan = card.querySelector('.task-text');
            if (textSpan) state.todo.push({ id: card.id, text: textSpan.innerText });
        });
    }
    if (inprogressCol) {
        inprogressCol.querySelectorAll('.task-card').forEach(card => {
            const textSpan = card.querySelector('.task-text');
            if (textSpan) state.inprogress.push({ id: card.id, text: textSpan.innerText });
        });
    }
    if (doneCol) {
        doneCol.querySelectorAll('.task-card').forEach(card => {
            const textSpan = card.querySelector('.task-text');
            if (textSpan) state.done.push({ id: card.id, text: textSpan.innerText });
        });
    }

    localStorage.setItem('kanbanState', JSON.stringify(state));
    console.log('DEBUG: saveState called. State to save:', state);
}

function loadState() {
    console.log('DEBUG: loadState called.');
    const stateJSON = localStorage.getItem('kanbanState');
    console.log('DEBUG: Raw state from localStorage:', stateJSON);
    if (!stateJSON) {
        console.log('DEBUG: No state found in localStorage.');
        return;
    }

    let state;
    try {
        state = JSON.parse(stateJSON);
        console.log('DEBUG: Parsed state from localStorage:', state);
    } catch (e) {
        console.error('DEBUG: Error parsing state from localStorage:', e);
        localStorage.removeItem('kanbanState'); // Clear corrupted state
        return;
    }

    if (!state) {
        console.log('DEBUG: Parsed state is null or undefined.');
        return;
    }

    // createTaskCardFromData is replaced by the more generic createTaskElement
    // const createTaskCardFromData = (taskData) => { ... };

    const todoContainer = document.querySelector('#todo-col .tasks-container');
    const inprogressContainer = document.querySelector('#inprogress-col .tasks-container');
    const doneContainer = document.querySelector('#done-col .tasks-container');

    if (todoContainer && state.todo && Array.isArray(state.todo)) {
        state.todo.forEach(taskData => {
            console.log('DEBUG: Loading task into TODO:', taskData);
            if(taskData && taskData.id && taskData.text !== undefined) {
                todoContainer.appendChild(createTaskElement(taskData));
            } else {
                console.warn('DEBUG: Invalid task data in TODO:', taskData);
            }
        });
    }
    if (inprogressContainer && state.inprogress && Array.isArray(state.inprogress)) {
        state.inprogress.forEach(taskData => {
            console.log('DEBUG: Loading task into INPROGRESS:', taskData);
            if(taskData && taskData.id && taskData.text !== undefined) {
                inprogressContainer.appendChild(createTaskElement(taskData));
            } else {
                console.warn('DEBUG: Invalid task data in INPROGRESS:', taskData);
            }
        });
    }
    if (doneContainer && state.done && Array.isArray(state.done)) {
        state.done.forEach(taskData => {
            console.log('DEBUG: Loading task into DONE:', taskData);
            if(taskData && taskData.id && taskData.text !== undefined) {
                doneContainer.appendChild(createTaskElement(taskData));
            } else {
                console.warn('DEBUG: Invalid task data in DONE:', taskData);
            }
        });
    }
    console.log('DEBUG: DOM reconstruction from state complete.');
}
