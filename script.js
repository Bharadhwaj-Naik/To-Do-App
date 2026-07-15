(function () {
  const STORAGE_KEY = 'taskManagerAppTasks';

  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse tasks from localStorage');
    }
    return [
      {
        id: '1',
        title: 'Review project plan',
        completed: false,
        priority: 'high',
        dueDate: '2026-07-20',
      },
      {
        id: '2',
        title: 'Buy groceries',
        completed: true,
        priority: 'medium',
        dueDate: '2026-07-14',
      },
      {
        id: '3',
        title: 'Read a book',
        completed: false,
        priority: 'low',
        dueDate: '',
      }
    ];
  }

  function saveTasksToStorage(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  let tasks = loadTasksFromStorage();
  let currentFilter = 'all';
  const taskListEl = document.getElementById('task-list');
  const emptyStateEl = document.getElementById('empty-state');
  const addTaskForm = document.getElementById('add-task-form');
  const titleInput = document.getElementById('task-title-input');
  const dateInput = document.getElementById('task-date-input');
  const priorityInput = document.getElementById('task-priority-input');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // helper: generate simple id
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  function getFilteredTasks() {
    if (currentFilter === 'active') {
      return tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
      return tasks.filter(task => task.completed);
    }
    return tasks; // all
  }

  function renderTasks() {
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
      taskListEl.innerHTML = '';
      emptyStateEl.style.display = 'block';
    } else {
      emptyStateEl.style.display = 'none';
      taskListEl.innerHTML = filtered.map(task => {
        const completedClass = task.completed ? 'completed-task' : '';
        const priorityClass = `priority-${task.priority}`;
        const dueDateFormatted = task.dueDate ? task.dueDate : '—';

        return `
              <li class="task-item ${completedClass}" data-task-id="${task.id}">
                <div class="task-left">
                  <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" data-id="${task.id}">
                  <div class="task-content">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <div class="task-meta">
                      <span class="priority-badge ${priorityClass}">${task.priority}</span>
                      <span class="due-date">📅 ${escapeHtml(dueDateFormatted)}</span>
                    </div>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="edit-btn" data-action="edit" data-id="${task.id}">Edit</button>
                  <button class="delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
                </div>
              </li>
            `;
      }).join('');
    }

    // attach event listeners dynamically (event delegation also used, but direct for clarity)
    attachTaskItemEvents();
  }

  // simple escape utility
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function attachTaskItemEvents() {
    // Using event delegation on the list itself to avoid rebinding every render.
    // But we also set data attributes; main listener added below.
  }

  // ---------- task operations ----------
  function addTask(title, dueDate, priority) {
    if (!title.trim()) return;
    const newTask = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      priority: priority,
      dueDate: dueDate || '',
    };
    tasks.push(newTask);
    saveTasksToStorage(tasks);
    renderTasks();
    updateFilterButtonsUI();
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
    updateFilterButtonsUI();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage(tasks);
    renderTasks();
    updateFilterButtonsUI();
  }

  function updateTask(taskId, updatedFields) {
    tasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updatedFields };
      }
      return task;
    });
    saveTasksToStorage(tasks);
    renderTasks();
    updateFilterButtonsUI();
  }

  // inline edit activation
  function startEditing(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const listItem = document.querySelector(`li[data-task-id="${taskId}"]`);
    if (!listItem) return;

    // replace inner content with edit form
    listItem.innerHTML = `
          <div class="inline-edit" data-edit-id="${taskId}">
            <input type="text" id="edit-title-${taskId}" value="${escapeHtml(task.title)}" placeholder="Task title" style="flex:2;">
            <input type="date" id="edit-date-${taskId}" value="${task.dueDate || ''}">
            <select id="edit-priority-${taskId}">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
            <button id="save-edit-${taskId}" data-action="save-edit" data-id="${taskId}">Save</button>
            <button id="cancel-edit-${taskId}" data-action="cancel-edit" data-id="${taskId}">Cancel</button>
          </div>
        `;
  }

  function cancelEditing(taskId) {
    // simply re-render to restore original view
    renderTasks();
  }

  function saveEdit(taskId) {
    const titleInputEdit = document.getElementById(`edit-title-${taskId}`);
    const dateInputEdit = document.getElementById(`edit-date-${taskId}`);
    const priorityInputEdit = document.getElementById(`edit-priority-${taskId}`);

    if (!titleInputEdit || !dateInputEdit || !priorityInputEdit) {
      renderTasks();
      return;
    }

    const newTitle = titleInputEdit.value.trim();
    if (!newTitle) {
      alert('Task title cannot be empty.');
      return;
    }

    const newDueDate = dateInputEdit.value;
    const newPriority = priorityInputEdit.value;

    updateTask(taskId, {
      title: newTitle,
      dueDate: newDueDate,
      priority: newPriority,
    });
  }

  // ---------- filter management ----------
  function setFilter(filter) {
    if (currentFilter === filter) return;
    currentFilter = filter;

    filterButtons.forEach(btn => {
      const filterValue = btn.getAttribute('data-filter');
      if (filterValue === filter) {
        btn.classList.add('active-filter');
      } else {
        btn.classList.remove('active-filter');
      }
    });

    renderTasks();
  }

  function updateFilterButtonsUI() {
    // ensure active class matches currentFilter after operations
    filterButtons.forEach(btn => {
      const filterValue = btn.getAttribute('data-filter');
      if (filterValue === currentFilter) {
        btn.classList.add('active-filter');
      } else {
        btn.classList.remove('active-filter');
      }
    });
  }

  // ---------- global event delegation ----------
  function handleGlobalClick(event) {
    const target = event.target;

    // Check for action buttons
    const action = target.getAttribute('data-action') || target.closest('button')?.getAttribute('data-action');
    const taskId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id') || target.closest('li')?.getAttribute('data-task-id');

    if (!action) return;

    // Handle checkbox toggle separately (input might have data-action)
    if (target.tagName === 'INPUT' && target.type === 'checkbox' && target.getAttribute('data-action') === 'toggle') {
      const id = target.getAttribute('data-id');
      if (id) toggleTaskCompletion(id);
      return;
    }

    // Button actions
    if (action === 'toggle' && target.tagName !== 'INPUT') {
      // fallback if checkbox clicked via label etc, but we handle input directly
      if (taskId) toggleTaskCompletion(taskId);
    }
    else if (action === 'delete') {
      if (taskId) deleteTask(taskId);
    }
    else if (action === 'edit') {
      if (taskId) startEditing(taskId);
    }
    else if (action === 'save-edit') {
      if (taskId) saveEdit(taskId);
    }
    else if (action === 'cancel-edit') {
      if (taskId) cancelEditing(taskId);
    }
  }

  // filter button clicks
  function setupFilterListeners() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        const filter = this.getAttribute('data-filter');
        if (filter) setFilter(filter);
      });
    });
  }

  // add task form submit
  function setupFormListener() {
    addTaskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = titleInput.value.trim();
      if (!title) {
        alert('Please enter a task title.');
        return;
      }
      const dueDate = dateInput.value;
      const priority = priorityInput.value;
      addTask(title, dueDate, priority);

      // reset form
      titleInput.value = '';
      dateInput.value = '';
      priorityInput.value = 'medium';
    });
  }

  // main event listener for task list (delegation)
  taskListEl.addEventListener('click', handleGlobalClick);

  // also handle checkbox change via change event for better coverage
  taskListEl.addEventListener('change', function (event) {
    const target = event.target;
    if (target.matches('input[type="checkbox"][data-action="toggle"]')) {
      const taskId = target.getAttribute('data-id');
      if (taskId) toggleTaskCompletion(taskId);
    }
  });

  // initial render
  function initialRender() {
    renderTasks();
    updateFilterButtonsUI();
  }

  setupFilterListeners();
  setupFormListener();
  initialRender();

  // ensure empty state visibility matches
})(); 