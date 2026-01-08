import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@slms/auth';
import { AppShell, Sidebar } from '@slms/ui';
import { Dashboard } from './pages/Dashboard';
import { StudentList } from './pages/students/StudentList';
import { ModuleList } from './pages/modules/ModuleList';
import { LOList } from './pages/learning-opportunities/LOList';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Studierende', href: '/students' },
  { label: 'Dozierende', href: '/lecturers' },
  { label: 'Module', href: '/modules' },
  { label: 'Lerngelegenheiten', href: '/learning-opportunities' },
  { label: 'Räume', href: '/rooms' },
  { label: 'Einstellungen', href: '/settings' },
];

function App() {
  return (
    <ProtectedRoute>
      <AppShell
        sidebar={<Sidebar items={navItems} currentPath={window.location.pathname} />}
        header={<header className="admin-header"><h1>SLMS Admin</h1></header>}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/modules" element={<ModuleList />} />
          <Route path="/learning-opportunities" element={<LOList />} />
        </Routes>
      </AppShell>
    </ProtectedRoute>
  );
}

export default App;
