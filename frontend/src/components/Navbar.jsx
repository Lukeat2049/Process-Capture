import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Playbook</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>
          My Library
        </Link>
        <Link to="/create" className="btn btn-primary btn-sm">
          + New Playbook
        </Link>
      </div>
    </nav>
  );
}
