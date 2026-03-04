import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import WorkflowSummary from '../components/WorkflowSummary.jsx';

const INITIAL_AI_MESSAGE = {
  role: 'assistant',
  content:
    "Hi! I'm here to help you document a work process. Start by briefly describing a task or workflow you'd like to capture — for example: \"I update our pricing spreadsheet every Monday morning\" or \"I process customer refund requests when they come in.\"",
};

function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="message-avatar">AI</div>
      <div className="typing-indicator">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}

function Message({ msg }) {
  return (
    <div className={`message ${msg.role}`}>
      <div className="message-avatar">
        {msg.role === 'assistant' ? 'AI' : 'You'}
      </div>
      <div className="message-bubble">{msg.content}</div>
    </div>
  );
}

export default function CreateProcess() {
  const navigate = useNavigate();

  // ── Chat state ───────────────────────────────────────────
  const [messages, setMessages]       = useState([INITIAL_AI_MESSAGE]);
  const [input, setInput]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [isComplete, setIsComplete]   = useState(false);
  const [error, setError]             = useState('');

  // ── Workflow generation state ────────────────────────────
  const [workflow, setWorkflow]           = useState(null);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isSaving, setIsSaving]           = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    setError('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Send all messages except the hardcoded initial one
      const apiMessages = newMessages.slice(1);
      const res = await api.chat(apiMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.message }]);
      if (res.isComplete) setIsComplete(true);
    } catch (err) {
      setError('Failed to get a response. Make sure the backend is running.');
      // Remove the user message on failure so they can retry
      setMessages(messages);
      setInput(text);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setError('');
    try {
      const apiMessages = messages.slice(1); // exclude hardcoded intro
      const generated = await api.generateWorkflow(apiMessages);
      setWorkflow(generated);
      setWorkflowTitle(generated.title);
    } catch (err) {
      setError('Failed to generate workflow. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!workflow) return;
    setIsSaving(true);
    try {
      const saved = await api.saveWorkflow({
        ...workflow,
        title: workflowTitle || workflow.title,
        conversation: messages.slice(1),
      });
      navigate(`/workflow/${saved.id}`);
    } catch (err) {
      setError('Failed to save workflow. Please try again.');
      setIsSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Auto-resize textarea
  function handleInputChange(e) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  return (
    <div className="create-page">
      <div className="create-layout">
        {/* ── LEFT: Chat ── */}
        <div className="create-left">
          <div className="chat-header">
            <h2>AI Interview</h2>
            <p>Answer each question to build your process document</p>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && <div className="error-banner">{error}</div>}
            <div ref={bottomRef} />
          </div>

          {isComplete && !workflow && (
            <div className="generate-bar">
              <p>Interview complete — ready to generate your workflow.</p>
              <button
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating…' : 'Generate Workflow'}
              </button>
            </div>
          )}

          {isComplete && workflow && (
            <div className="generate-bar">
              <p>Workflow generated. Review it on the right, then save.</p>
            </div>
          )}

          {!isComplete && (
            <div className="chat-input-area">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your response… (Enter to send)"
                rows={1}
                disabled={isLoading}
              />
              <button
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
              >
                Send
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Generated workflow ── */}
        <div className="create-right">
          {!workflow ? (
            <div className="panel-empty">
              <div className="panel-empty-icon">📋</div>
              <p>
                Your structured workflow will appear here once the interview is
                complete and you click "Generate Workflow".
              </p>
            </div>
          ) : (
            <>
              <div className="panel-header">
                <h2>Generated Workflow</h2>
              </div>

              <div className="workflow-summary">
                <WorkflowSummary
                  workflow={workflow}
                  titleValue={workflowTitle}
                  onTitleChange={setWorkflowTitle}
                  editable
                />
              </div>

              <div className="save-bar">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save Workflow'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
