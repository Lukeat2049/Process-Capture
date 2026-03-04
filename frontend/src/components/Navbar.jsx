import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ProcessCapture</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
          My Workflows
        </Link>
        <Link to="/create" className="btn btn-primary btn-sm">
          + New Process
        </Link>
      </div>
    </nav>
  );
}
