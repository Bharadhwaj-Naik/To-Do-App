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

function startEditing(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
  if (!listItem) return;
  
  listItem.innerHTML = `
    <div class="inline-edit">
      <input type="text" id="edit-title-${taskId}" value="${escapeHtml(task.title)}" style="flex:2;">
      <button id="save-edit-${taskId}" data-action="save-edit" data-id="${taskId}">Save</button>
      <button id="cancel-edit-${taskId}" data-action="cancel-edit" data-id="${taskId}">Cancel</button>
    </div>
  `;
}

function saveEdit(taskId) {
  const titleInput = document.getElementById(`edit-title-${taskId}`);
  if (!titleInput) return;
  
  const newTitle = titleInput.value.trim();
  if (!newTitle) {
    alert('Task title cannot be empty.');
    return;
  }
  
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, title: newTitle };
    }
    return task;
  });
  
  saveTasksToStorage(tasks);
  renderTasks();
}

function cancelEditing(taskId) {
  renderTasks();
}

// Update the click event handler to include:
// Add these conditions in the existing taskListEl click handler
if (action === 'edit') {
  startEditing(taskId);
} else if (action === 'save-edit') {
  saveEdit(taskId);
} else if (action === 'cancel-edit') {
  cancelEditing(taskId);
}

let currentFilter = 'all';

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    return tasks.filter(task => task.completed);
  }
  return tasks;
}

// Update renderTasks to use filtered tasks:
function renderTasks() {
  const filtered = getFilteredTasks();
  
  if (filtered.length === 0) {
    taskListEl.innerHTML = '';
    emptyStateEl.style.display = 'block';
  } else {
    emptyStateEl.style.display = 'none';
    taskListEl.innerHTML = filtered.map(task => `
      <!-- same task HTML -->
    `).join('');
  }
}

function setFilter(filter) {
  currentFilter = filter;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.classList.add('active-filter');
    } else {
      btn.classList.remove('active-filter');
    }
  });
  
  renderTasks();
}

// Add filter button listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    setFilter(this.getAttribute('data-filter'));
  });
});

// Set initial active filter
document.querySelector('[data-filter="all"]').classList.add('active-filter');

function startEditing(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
  if (!listItem) return;
  
  listItem.innerHTML = `
    <div class="inline-edit">
      <input type="text" id="edit-title-${taskId}" value="${escapeHtml(task.title)}">
      <input type="date" id="edit-date-${taskId}" value="${task.dueDate || ''}">
      <select id="edit-priority-${taskId}">
        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
      </select>
      <button data-action="save-edit" data-id="${taskId}">Save</button>
      <button data-action="cancel-edit" data-id="${taskId}">Cancel</button>
    </div>
  `;
}

function saveEdit(taskId) {
  const titleInput = document.getElementById(`edit-title-${taskId}`);
  const dateInput = document.getElementById(`edit-date-${taskId}`);
  const priorityInput = document.getElementById(`edit-priority-${taskId}`);
  
  if (!titleInput) return;
  
  const newTitle = titleInput.value.trim();
  if (!newTitle) {
    alert('Task title cannot be empty.');
    return;
  }
  
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return {
        ...task,
        title: newTitle,
        dueDate: dateInput?.value || '',
        priority: priorityInput?.value || 'medium',
      };
    }
    return task;
  });
  
  saveTasksToStorage(tasks);
  renderTasks();
}