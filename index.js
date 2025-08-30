// Retrieve elements from DOM
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const themeSwitch = document.querySelector('.theme-switch');
const filters = document.querySelectorAll('.filter');

// General variables
let tasks = [];
let currentFilter = 'all';
let draggedItem = null;

// Check for saved data in local storage
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve tasks from local storage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }

    // Retrieve preferred theme (dark/light)
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeSwitch.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    taskInput.value = '';
    saveTasks();
    renderTasks();
}

// Update task status (completed/incomplete)
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Edit a task
function editTask(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;

    const newText = prompt('تعديل المهمة:', task.text);
    if (newText === null || newText.trim() === '') return;

    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText.trim() };
        }
        return task;
    });

    saveTasks();
    renderTasks();
}

// Save tasks to local storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Display tasks based on the current filter
function renderTasks() {
    let filteredTasks = [];

    switch (currentFilter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed);
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            break;
        default:
            filteredTasks = [...tasks];
    }

    todoList.innerHTML = '';

    if (filteredTasks.length === 0) {
        todoList.innerHTML = `
            <div class="todo-item empty-list">
                <p>لا توجد مهام ${currentFilter === 'completed' ? 'مكتملة' : currentFilter === 'active' ? 'نشطة' : ''}</p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('todo-item');
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            taskElement.setAttribute('data-id', task.id);
            taskElement.draggable = true;

            taskElement.innerHTML = `
                <div class="checkbox" onclick="toggleTask(${task.id})">
                    <i class="fas fa-check"></i>
                </div>
                <div class="task-text">${task.text}</div>
                <div class="edit-btn" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-times"></i>
                </div>
            `;

            // Add drag and drop events
            taskElement.addEventListener('dragstart', handleDragStart);
            taskElement.addEventListener('dragover', handleDragOver);
            taskElement.addEventListener('drop', handleDrop);
            taskElement.addEventListener('dragend', handleDragEnd);

            todoList.appendChild(taskElement);
        });
    }

    // Update remaining tasks counter
    const activeTasks = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeTasks} مهام متبقية`;
}

// Drag and drop functions
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (this !== draggedItem) {
        // Reorder tasks in the array
        const draggedId = parseInt(draggedItem.getAttribute('data-id'));
        const targetId = parseInt(this.getAttribute('data-id'));
        
        const draggedIndex = tasks.findIndex(task => task.id === draggedId);
        const targetIndex = tasks.findIndex(task => task.id === targetId);
        
        const [movedTask] = tasks.splice(draggedIndex, 1);
        tasks.splice(targetIndex, 0, movedTask);
        
        saveTasks();
        renderTasks();
    }
}

function handleDragEnd() {
    this.classList.remove('dragging');
    const items = document.querySelectorAll('.todo-item');
    items.forEach(item => item.classList.remove('drag-over'));
}

// Toggle dark/light theme
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-theme');
    themeSwitch.innerHTML = isDarkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
}

// Change active filter
function changeFilter(filter) {
    currentFilter = filter;
    filters.forEach(f => {
        if (f.getAttribute('data-filter') === filter) {
            f.classList.add('active');
        } else {
            f.classList.remove('active');
        }
    });
    renderTasks();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// Add click events
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

themeSwitch.addEventListener('click', toggleTheme);

filters.forEach(filter => {
    filter.addEventListener('click', () => {
        changeFilter(filter.getAttribute('data-filter'));
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Define functions in the global scope for access from HTML
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;
window.editTask = editTask;
