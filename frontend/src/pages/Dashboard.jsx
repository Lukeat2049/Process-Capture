import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import WorkflowCard from '../components/WorkflowCard.jsx';

export default function Dashboard() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    api.getWorkflows()
      .then(setWorkflows)
      .catch(() => setError('Could not load workflows. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch {
      setError('Failed to delete workflow.');
    }
  }

  return (
    <div className="container-lg">
      <div className="page-header">
        <h1>My Workflows</h1>
        <p>All your documented processes in one place</p>
      </div>

      <div className="page-toolbar">
        <span>
          {loading ? '' : `${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}`}
        </span>
        <Link to="/create" className="btn btn-primary">
          + New Process
        </Link>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <div className="workflows-grid">
          {workflows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No workflows yet</h3>
              <p>Document your first work process to get started.</p>
              <Link to="/create" className="btn btn-primary">
                Document a Process
              </Link>
            </div>
          ) : (
            workflows.map(w => (
              <WorkflowCard key={w.id} workflow={w} onDelete={handleDelete} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
