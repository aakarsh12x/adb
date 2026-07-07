import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8000';

async function getTodos() {
  const res = await fetch(`${API_BASE}/todos/`);
  if (!res.ok) throw new Error(`GET /todos failed: ${res.status}`);
  const data = await res.json();
  return data.todos;
}

async function createTodo(description) {
  const res = await fetch(`${API_BASE}/todos/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description }),
  });
  if (!res.ok) throw new Error(`POST /todos failed: ${res.status}`);
  return res.json();
}

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    try {
      await createTodo(trimmed);
      const updated = await getTodos();
      setTodos(updated);
      setInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="App">
      <div>
        <h1>List of TODOs</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.description}</li>
          ))}
        </ul>
      </div>

      <div>
        <h1>Create a ToDo</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="todo">ToDo: </label>
            <input
              id="todo"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div style={{ marginTop: '5px' }}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add ToDo!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
