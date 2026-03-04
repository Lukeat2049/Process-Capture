import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import CreateProcess from './pages/CreateProcess.jsx';
import Dashboard from './pages/Dashboard.jsx';
import WorkflowView from './pages/WorkflowView.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/create"        element={<CreateProcess />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/workflow/:id"  element={<WorkflowView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
