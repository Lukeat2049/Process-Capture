import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function Section({ label, children }) {
  return (
    <div className="wf-view-section">
      <h3>{label}</h3>
      {children}
    </div>
  );
}

export default function WorkflowView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.getWorkflow(id)
      .then(setWorkflow)
      .catch(() => setError('Workflow not found.'))
      .finally(() => setLoading(false));
  }, [id]);

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
      <div className="workflow-view-back">
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="workflow-view-header">
        <h1>{workflow.title}</h1>
        <div className="workflow-view-meta">
          Documented on {formatDate(workflow.created_at)}
        </div>
      </div>

      {workflow.purpose && (
        <Section label="Purpose">
          <p style={{ fontSize: '.9rem', lineHeight: 1.65 }}>{workflow.purpose}</p>
        </Section>
      )}

      {workflow.trigger_event && (
        <Section label="Trigger">
          <p style={{ fontSize: '.9rem', lineHeight: 1.65 }}>{workflow.trigger_event}</p>
        </Section>
      )}

      {workflow.tools_used?.length > 0 && (
        <Section label="Tools Used">
          <div className="tools-wrap">
            {workflow.tools_used.map((t, i) => (
              <span key={i} className="tool-badge">{t}</span>
            ))}
          </div>
        </Section>
      )}

      {workflow.steps?.length > 0 && (
        <Section label="Step-by-Step Instructions">
          <div className="steps-list">
            {workflow.steps.map((step, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{step.number ?? i + 1}</div>
                <div className="step-body">
                  <div className="step-action">{step.action}</div>
                  {step.details && <div className="step-details">{step.details}</div>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {workflow.decision_points?.length > 0 && (
        <Section label="Decision Points">
          <div className="bullet-list">
            {workflow.decision_points.map((dp, i) => (
              <div key={i} className="bullet-item">
                <span className="bullet-dot">&#9670;</span>
                <span style={{ fontSize: '.9rem' }}>{dp}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {workflow.common_issues?.length > 0 && (
        <Section label="Common Issues">
          <div className="bullet-list">
            {workflow.common_issues.map((issue, i) => (
              <div key={i} className="bullet-item">
                <span className="bullet-dot">&#9670;</span>
                <span style={{ fontSize: '.9rem' }}>{issue}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {workflow.estimated_time && (
        <Section label="Estimated Time">
          <span className="time-badge">{workflow.estimated_time}</span>
        </Section>
      )}

      <div className="workflow-actions">
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete Workflow
        </button>
        <Link to="/create" className="btn btn-primary">
          + Document Another Process
        </Link>
      </div>
    </div>
  );
}
