/**
 * Renders the structured workflow document.
 * Used both in the Create flow (editable title, onSave callback)
 * and in WorkflowView (read-only).
 */
export default function WorkflowSummary({ workflow, titleValue, onTitleChange, editable = false }) {
  if (!workflow) return null;

  const title = titleValue ?? workflow.title;

  return (
    <>
      {editable ? (
        <input
          className="workflow-title-input"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Workflow title"
          aria-label="Workflow title"
        />
      ) : (
        <h1 className="workflow-view-header" style={{ marginBottom: '1.5rem' }}>
          {title}
        </h1>
      )}

      {workflow.purpose && (
        <div className="wf-section">
          <div className="wf-section-label">Purpose</div>
          <p>{workflow.purpose}</p>
        </div>
      )}

      {workflow.trigger_event && (
        <div className="wf-section">
          <div className="wf-section-label">Trigger</div>
          <p>{workflow.trigger_event}</p>
        </div>
      )}

      {workflow.tools_used?.length > 0 && (
        <div className="wf-section">
          <div className="wf-section-label">Tools Used</div>
          <div className="tools-wrap">
            {workflow.tools_used.map((t, i) => (
              <span key={i} className="tool-badge">{t}</span>
            ))}
          </div>
        </div>
      )}

      {workflow.steps?.length > 0 && (
        <div className="wf-section">
          <div className="wf-section-label">Step-by-Step Instructions</div>
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
        </div>
      )}

      {workflow.decision_points?.length > 0 && (
        <div className="wf-section">
          <div className="wf-section-label">Decision Points</div>
          <div className="bullet-list">
            {workflow.decision_points.map((dp, i) => (
              <div key={i} className="bullet-item">
                <span className="bullet-dot">&#9670;</span>
                <span>{dp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflow.common_issues?.length > 0 && (
        <div className="wf-section">
          <div className="wf-section-label">Common Issues</div>
          <div className="bullet-list">
            {workflow.common_issues.map((issue, i) => (
              <div key={i} className="bullet-item">
                <span className="bullet-dot">&#9670;</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {workflow.estimated_time && (
        <div className="wf-section">
          <div className="wf-section-label">Estimated Time</div>
          <span className="time-badge">{workflow.estimated_time}</span>
        </div>
      )}
    </>
  );
}
