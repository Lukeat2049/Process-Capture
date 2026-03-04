import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    icon: '🎙️',
    title: 'Just talk through it',
    desc: "Describe your process like you're explaining it to a new colleague. No writing, no templates — just a conversation.",
  },
  {
    num: '02',
    icon: '⚡',
    title: 'AI fills in the gaps',
    desc: 'Playbook asks the right follow-up questions — what triggers it, what tools you use, what can go wrong — until the picture is complete.',
  },
  {
    num: '03',
    icon: '📄',
    title: 'Instant documentation',
    desc: 'Your conversation becomes a clean, structured process doc with steps, decisions, and time estimates. Ready to share in seconds.',
  },
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-label">✦ AI-powered process capture</div>
        <h1>
          Stop losing knowledge<br />
          when <em>people leave</em>
        </h1>
        <p>
          Playbook turns how your team works into structured, shareable documentation —
          automatically. Just describe your process. We handle the rest.
        </p>
        <div className="home-actions">
          <Link to="/create" className="btn btn-primary btn-lg">
            Start documenting →
          </Link>
          <Link to="/dashboard" className="btn btn-secondary btn-lg">
            My library
          </Link>
        </div>
      </section>

      <section className="home-how">
        <div className="container">
          <div className="section-label">How it works</div>
          <h2>From your head to a playbook<br />in three steps</h2>
          <div className="steps-cards">
            {STEPS.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-card-num">Step {s.num}</div>
                <div className="step-card-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
