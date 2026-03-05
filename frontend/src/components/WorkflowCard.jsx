import { useNavigate } from 'react-router-dom';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function WorkflowCard({ workflow, onDelete }) {
  const navigate = useNavigate();

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete "${workflow.title}"? This cannot be undone.`)) {
      onDelete(workflow.id);
    }
  }

  return (
    <div className="workflow-card" onClick={() => navigate(`/workflow/${workflow.id}`)}>
      <div className="workflow-card-strip" />
      <div className="workflow-card-body">
        <div className="workflow-card-title">{workflow.title}</div>
        <div className="workflow-card-date">{formatDate(workflow.created_at)}</div>
        {workflow.purpose && (
          <div className="workflow-card-purpose">{workflow.purpose}</div>
        )}
        <div className="workflow-card-footer">
          <span className="step-count-badge">
            {workflow.steps?.length ?? 0} steps
          </span>
          <div className="card-actions">
            <button
              className="btn btn-secondary btn-sm"
              onClick={e => { e.stopPropagation(); navigate(`/workflow/${workflow.id}`); }}
            >
              View
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
