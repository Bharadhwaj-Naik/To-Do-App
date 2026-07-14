 const STORAGE_KEY = 'taskManagerAppTasks';

  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to parse tasks');
      return [];
    }
  }

  function saveTasksToStorage(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  let tasks = loadTasksFromStorage();

  const taskListEl = document.getElementById('task-list');
const emptyStateEl = document.getElementById('empty-state');
const addTaskForm = document.getElementById('add-task-form');
const titleInput = document.getElementById('task-title-input');

function renderTasks() {
  if (tasks.length === 0) {
    taskListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
  } else {
    emptyStateEl.style.display = 'none';
    taskListEl.innerHTML = tasks.map(task => `
      <li class="task-item ${task.completed ? 'completed-task' : ''}" data-task-id="${task.id}">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>
        <div class="task-actions">
          <button class="edit-btn">Edit</button>
          <button class="delete-btn">Delete</button>
        </div>
      </li>
    `).join('');
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function addTask(title) {
  if (!title.trim()) return;
  const newTask = {
    id: generateId(),
    title: title.trim(),
    completed: false,
  };
  tasks.push(newTask);
  saveTasksToStorage(tasks);
  renderTasks();
}

addTaskForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    alert('Please enter a task title.');
    return;
  }
  addTask(title);
  titleInput.value = '';
});

// Initial render
renderTasks();

function renderTasks() {
  if (tasks.length === 0) {
    taskListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
  } else {
    emptyStateEl.style.display = 'none';
    taskListEl.innerHTML = tasks.map(task => `
      <li class="task-item ${task.completed ? 'completed-task' : ''}" data-task-id="${task.id}">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" data-id="${task.id}">
          <span class="task-title">${escapeHtml(task.title)}</span>
        </div>
        <div class="task-actions">
          <button class="edit-btn" data-action="edit" data-id="${task.id}">Edit</button>
          <button class="delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
        </div>
      </li>
    `).join('');
  }
}

function toggleTaskCompletion(taskId) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasksToStorage(tasks);
  renderTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasksToStorage(tasks);
  renderTasks();
}

// Event delegation
taskListEl.addEventListener('click', function(event) {
  const target = event.target;
  const action = target.getAttribute('data-action');
  const taskId = target.getAttribute('data-id');

  if (action === 'toggle') {
    toggleTaskCompletion(taskId);
  } else if (action === 'delete') {
    deleteTask(taskId);
  }
});

taskListEl.addEventListener('change', function(event) {
  if (event.target.matches('input[type="checkbox"][data-action="toggle"]')) {
    const taskId = event.target.getAttribute('data-id');
    toggleTaskCompletion(taskId);
  }
});