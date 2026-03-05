function EditableText({ value, onChange, placeholder, multiline = false }) {
  const style = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid transparent',
    outline: 'none',
    color: 'var(--text-secondary)',
    fontSize: '.875rem',
    lineHeight: '1.65',
    fontFamily: 'inherit',
    resize: 'none',
    padding: '0',
    transition: 'border-color .15s',
  };

  const handleFocus = e => { e.target.style.borderBottomColor = 'var(--border)'; };
  const handleBlur  = e => { e.target.style.borderBottomColor = 'transparent'; };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        rows={2}
        style={{ ...style, overflowY: 'hidden' }}
        onInput={e => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={style}
    />
  );
}

/**
 * Renders the structured workflow document.
 * When editable=true, all fields are inline-editable.
 * onUpdate(newWorkflow) is called on any change.
 */
export default function WorkflowSummary({
  workflow,
  titleValue,
  onTitleChange,
  editable = false,
  onUpdate,
}) {
  if (!workflow) return null;

  const title = titleValue ?? workflow.title;

  function set(field, value) {
    if (onUpdate) onUpdate({ ...workflow, [field]: value });
  }

  function setArrayItem(field, index, value) {
    const arr = (workflow[field] || []).map((item, i) => i === index ? value : item);
    set(field, arr);
  }

  function addArrayItem(field, defaultValue) {
    set(field, [...(workflow[field] || []), defaultValue]);
  }

  function removeArrayItem(field, index) {
    set(field, (workflow[field] || []).filter((_, i) => i !== index));
  }

  function setStep(index, key, value) {
    const steps = (workflow.steps || []).map((s, i) =>
      i === index ? { ...s, [key]: value } : s
    );
    set('steps', steps);
  }

  function addStep() {
    const num = (workflow.steps?.length ?? 0) + 1;
    set('steps', [...(workflow.steps || []), { number: num, action: '', details: '' }]);
  }

  function removeStep(index) {
    const steps = (workflow.steps || [])
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, number: i + 1 }));
    set('steps', steps);
  }

  return (
    <>
      {/* Title */}
      {editable ? (
        <input
          className="workflow-title-input"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="Workflow title"
        />
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.15 }}>
            {title}
          </h1>
        </div>
      )}

      {/* Purpose */}
      <div className="wf-section">
        <div className="wf-section-label">Purpose</div>
        {editable ? (
          <EditableText
            value={workflow.purpose || ''}
            onChange={v => set('purpose', v)}
            placeholder="Why does this process exist?"
            multiline
          />
        ) : (
          <p>{workflow.purpose}</p>
        )}
      </div>

      {/* Trigger */}
      <div className="wf-section">
        <div className="wf-section-label">Trigger</div>
        {editable ? (
          <EditableText
            value={workflow.trigger_event || ''}
            onChange={v => set('trigger_event', v)}
            placeholder="What starts this process?"
          />
        ) : (
          <p>{workflow.trigger_event}</p>
        )}
      </div>

      {/* Tools */}
      <div className="wf-section">
        <div className="wf-section-label">Tools Used</div>
        <div className="tools-wrap" style={{ gap: '.4rem', alignItems: 'center' }}>
          {(workflow.tools_used || []).map((t, i) =>
            editable ? (
              <span key={i} className="tool-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
                <input
                  value={t}
                  onChange={e => setArrayItem('tools_used', i, e.target.value)}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--accent)', fontFamily: 'inherit', fontSize: '.75rem', fontWeight: 600, width: Math.max(t.length, 4) + 'ch' }}
                />
                <button onClick={() => removeArrayItem('tools_used', i)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '.8rem', lineHeight: 1, opacity: .7 }}>×</button>
              </span>
            ) : (
              <span key={i} className="tool-badge">{t}</span>
            )
          )}
          {editable && (
            <button onClick={() => addArrayItem('tools_used', 'New tool')} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: '500px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.72rem', padding: '.2rem .6rem', fontFamily: 'inherit' }}>
              + Add tool
            </button>
          )}
        </div>
      </div>

      {/* Steps */}
      <div className="wf-section">
        <div className="wf-section-label">Step-by-Step Instructions</div>
        <div className="steps-list">
          {(workflow.steps || []).map((step, i) => (
            <div key={i} className="step-item" style={{ alignItems: 'flex-start' }}>
              <div className="step-num">{i + 1}</div>
              <div className="step-body" style={{ flex: 1 }}>
                {editable ? (
                  <>
                    <input
                      value={step.action || ''}
                      onChange={e => setStep(i, 'action', e.target.value)}
                      placeholder="Step title"
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none', color: 'var(--text)', fontSize: '.875rem', fontWeight: 700, fontFamily: 'inherit', padding: '0 0 .1rem', marginBottom: '.2rem' }}
                      onFocus={e => e.target.style.borderBottomColor = 'var(--border)'}
                      onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                    />
                    <textarea
                      value={step.details || ''}
                      onChange={e => setStep(i, 'details', e.target.value)}
                      placeholder="Details (optional)"
                      rows={1}
                      style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid transparent', outline: 'none', color: 'var(--text-secondary)', fontSize: '.82rem', fontFamily: 'inherit', resize: 'none', padding: 0, lineHeight: 1.5 }}
                      onFocus={e => e.target.style.borderBottomColor = 'var(--border)'}
                      onBlur={e => e.target.style.borderBottomColor = 'transparent'}
                      onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                    />
                  </>
                ) : (
                  <>
                    <div className="step-action">{step.action}</div>
                    {step.details && <div className="step-details">{step.details}</div>}
                  </>
                )}
              </div>
              {editable && (
                <button onClick={() => removeStep(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', paddingLeft: '.5rem', lineHeight: 1 }}>×</button>
              )}
            </div>
          ))}
          {editable && (
            <button onClick={addStep} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.8rem', padding: '.4rem .75rem', fontFamily: 'inherit', textAlign: 'left', marginTop: '.25rem' }}>
              + Add step
            </button>
          )}
        </div>
      </div>

      {/* Decision Points */}
      <div className="wf-section">
        <div className="wf-section-label">Decision Points</div>
        <div className="bullet-list">
          {(workflow.decision_points || []).map((dp, i) => (
            <div key={i} className="bullet-item">
              <span className="bullet-dot">&#9670;</span>
              {editable ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <EditableText value={dp} onChange={v => setArrayItem('decision_points', i, v)} placeholder="If [condition], then [action]..." />
                  <button onClick={() => removeArrayItem('decision_points', i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
                </div>
              ) : (
                <span style={{ fontSize: '.875rem' }}>{dp}</span>
              )}
            </div>
          ))}
          {editable && (
            <button onClick={() => addArrayItem('decision_points', '')} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.8rem', padding: '.35rem .75rem', fontFamily: 'inherit', marginTop: '.35rem' }}>
              + Add decision point
            </button>
          )}
        </div>
      </div>

      {/* Common Issues */}
      <div className="wf-section">
        <div className="wf-section-label">Common Issues</div>
        <div className="bullet-list">
          {(workflow.common_issues || []).map((issue, i) => (
            <div key={i} className="bullet-item">
              <span className="bullet-dot">&#9670;</span>
              {editable ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <EditableText value={issue} onChange={v => setArrayItem('common_issues', i, v)} placeholder="Issue and how to resolve it..." />
                  <button onClick={() => removeArrayItem('common_issues', i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}>×</button>
                </div>
              ) : (
                <span style={{ fontSize: '.875rem' }}>{issue}</span>
              )}
            </div>
          ))}
          {editable && (
            <button onClick={() => addArrayItem('common_issues', '')} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '.8rem', padding: '.35rem .75rem', fontFamily: 'inherit', marginTop: '.35rem' }}>
              + Add issue
            </button>
          )}
        </div>
      </div>

      {/* Estimated Time */}
      <div className="wf-section">
        <div className="wf-section-label">Estimated Time</div>
        {editable ? (
          <EditableText
            value={workflow.estimated_time || ''}
            onChange={v => set('estimated_time', v)}
            placeholder="e.g. 30 minutes"
          />
        ) : (
          <span className="time-badge">{workflow.estimated_time}</span>
        )}
      </div>
    </>
  );
}
