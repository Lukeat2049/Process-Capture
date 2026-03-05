import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import WorkflowSummary from '../components/WorkflowSummary.jsx';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function WorkflowView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workflow, setWorkflow]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [editing, setEditing]     = useState(false);
  const [draft, setDraft]         = useState(null);
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    api.getWorkflow(id)
      .then(w => { setWorkflow(w); setDraft(w); })
      .catch(() => setError('Workflow not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const updated = await api.updateWorkflow(id, draft);
      setWorkflow(updated);
      setDraft(updated);
      setEditing(false);
    } catch {
      setError('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setDraft(workflow);
    setEditing(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${workflow.title}"? This cannot be undone.`)) return;
    try {
      await api.deleteWorkflow(id);
      navigate('/dashboard');
    } catch {
      setError('Failed to delete workflow.');
    }
  }

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error)   return <div className="workflow-view"><div className="error-banner">{error}</div></div>;
  if (!workflow) return null;

  return (
    <div className="workflow-view">
      <div className="workflow-view-back" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Back
        </Link>
        {!editing ? (
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {!editing && (
        <div className="workflow-view-meta" style={{ marginBottom: '2rem', marginTop: '.5rem' }}>
          Documented on {formatDate(workflow.created_at)}
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div style={{ background: editing ? 'var(--surface)' : 'transparent', borderRadius: editing ? 'var(--radius-lg)' : 0, padding: editing ? '1.5rem' : 0, border: editing ? '1px solid var(--border)' : 'none' }}>
        <WorkflowSummary
          workflow={editing ? draft : workflow}
          titleValue={editing ? draft.title : workflow.title}
          onTitleChange={v => setDraft(d => ({ ...d, title: v }))}
          editable={editing}
          onUpdate={updated => setDraft(updated)}
        />
      </div>

      {!editing && (
        <div className="workflow-actions">
          <Link to="/create" className="btn btn-primary">
            + Document Another Process
          </Link>
        </div>
      )}
    </div>
  );
}
