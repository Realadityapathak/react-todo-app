import React, { useState, useEffect } from 'react';

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Validate and add new task
  const addTask = () => {
    const trimmedText = inputText.trim();
    
    if (!trimmedText) {
      setError('Please enter a task');
      return;
    }
    
    if (trimmedText.length < 3) {
      setError('Task must be at least 3 characters long');
      return;
    }
    
    if (tasks.some(task => task.text.toLowerCase() === trimmedText.toLowerCase())) {
      setError('This task already exists');
      return;
    }

    const newTask = {
      id: Date.now(),
      text: trimmedText,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setInputText('');
    setError('');
  };

  // Remove task
  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Toggle task completion
  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Filter tasks
  const getFilteredTasks = () => {
    switch (filter) {
      case 'active':
        return tasks.filter(task => !task.completed);
      case 'completed':
        return tasks.filter(task => task.completed);
      default:
        return tasks;
    }
  };

  // Sort tasks
  const getSortedTasks = (filteredTasks) => {
    const sortedTasks = [...filteredTasks];
    
    switch (sortBy) {
      case 'oldest':
        return sortedTasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'alphabetical':
        return sortedTasks.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
      case 'completed':
        return sortedTasks.sort((a, b) => a.completed - b.completed);
      default: // newest
        return sortedTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Clear all tasks
  const clearAllTasks = () => {
    if (window.confirm('Are you sure you want to clear all tasks?')) {
      setTasks([]);
    }
  };

  const filteredTasks = getFilteredTasks();
  const sortedTasks = getSortedTasks(filteredTasks);
  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  return (
    <div style={styles.container}>
      <div style={styles.todoApp}>
        <h1 style={styles.title}>📝 My To-Do List</h1>
        
        {/* Add Task Section */}
        <div style={styles.addSection}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a new task..."
              style={{
                ...styles.input,
                ...(error ? styles.inputError : {})
              }}
            />
            <button onClick={addTask} style={styles.addButton}>
              Add Task
            </button>
          </div>
          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <span>Total: {totalCount} | Completed: {completedCount} | Remaining: {totalCount - completedCount}</span>
        </div>

        {/* Controls */}
        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.select}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="completed">Completed Last</option>
            </select>
          </div>

          {tasks.length > 0 && (
            <button onClick={clearAllTasks} style={styles.clearButton}>
              Clear All
            </button>
          )}
        </div>

        {/* Task List */}
        <div style={styles.taskList}>
          {sortedTasks.length === 0 ? (
            <div style={styles.emptyState}>
              {tasks.length === 0 
                ? "No tasks yet. Add one above!" 
                : "No tasks match your current filter."
              }
            </div>
          ) : (
            sortedTasks.map(task => (
              <div 
                key={task.id} 
                style={{
                  ...styles.taskItem,
                  ...(task.completed ? styles.taskCompleted : {})
                }}
              >
                <div style={styles.taskContent}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    style={styles.checkbox}
                  />
                  <span 
                    style={{
                      ...styles.taskText,
                      ...(task.completed ? styles.taskTextCompleted : {})
                    }}
                  >
                    {task.text}
                  </span>
                </div>
                <div style={styles.taskActions}>
                  <span style={styles.taskDate}>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => removeTask(task.id)}
                    style={styles.removeButton}
                    title="Delete task"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  todoApp: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '30px'
  },
  title: {
    textAlign: 'center',
    color: '#2d3748',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: '600'
  },
  addSection: {
    marginBottom: '20px'
  },
  inputGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  inputError: {
    borderColor: '#e53e3e'
  },
  addButton: {
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    marginTop: '5px'
  },
  stats: {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#4a5568',
    fontSize: '14px'
  },
  controls: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#a0aec0',
    fontSize: '16px'
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'all 0.2s'
  },
  taskCompleted: {
    backgroundColor: '#f0fff4',
    borderColor: '#9ae6b4'
  },
  taskContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  taskText: {
    fontSize: '16px',
    color: '#2d3748',
    flex: 1
  },
  taskTextCompleted: {
    textDecoration: 'line-through',
    color: '#a0aec0'
  },
  taskActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  taskDate: {
    fontSize: '12px',
    color: '#a0aec0'
  },
  removeButton: {
    width: '30px',
    height: '30px',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: '#fed7d7',
    color: '#e53e3e',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  }
};

export default TodoApp;