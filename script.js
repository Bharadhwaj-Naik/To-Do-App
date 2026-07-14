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