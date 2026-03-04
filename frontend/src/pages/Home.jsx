import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🎙️',
    title: 'AI-Guided Interview',
    desc: 'Describe your task in plain language. The AI asks smart follow-up questions to capture every detail.',
  },
  {
    icon: '📋',
    title: 'Structured Output',
    desc: 'Automatically converts your explanation into a clean, standardized process document anyone can follow.',
  },
  {
    icon: '📂',
    title: 'Save & Share',
    desc: 'Save all your documented workflows in one place. Build an organizational knowledge base over time.',
  },
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <h1>
          Turn tribal knowledge into<br />
          <span>structured workflows</span>
        </h1>
        <p>
          ProcessCapture uses an AI interviewer to guide employees through describing
          how they work — then instantly converts it into a clear, repeatable process
          document that anyone on your team can understand.
        </p>
        <div className="home-actions">
          <Link to="/create" className="btn btn-primary btn-lg">
            Document a Process
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">
            View Saved Workflows
          </Link>
        </div>
      </section>

      <section className="home-features">
        <h2>How it works</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
