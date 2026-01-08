import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@slms/auth';
import { AppShell, Sidebar } from '@slms/ui';
import { Dashboard } from './pages/Dashboard';
import { ModuleCatalog } from './pages/modules/ModuleCatalog';
import { MyRegistrations } from './pages/registrations/MyRegistrations';
import { MySchedule } from './pages/schedule/MySchedule';
import { Transcript } from './pages/transcript/Transcript';
import { Favorites } from './pages/favorites/Favorites';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Modulkatalog', href: '/modules' },
  { label: 'Meine Anmeldungen', href: '/registrations' },
  { label: 'Stundenplan', href: '/schedule' },
  { label: 'Notenspiegel', href: '/transcript' },
  { label: 'Favoriten', href: '/favorites' },
];

function App() {
  return (
    <ProtectedRoute>
      <AppShell
        sidebar={<Sidebar items={navItems} currentPath={window.location.pathname} />}
        header={<header className="student-header"><h1>Studierendenportal</h1></header>}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modules" element={<ModuleCatalog />} />
          <Route path="/registrations" element={<MyRegistrations />} />
          <Route path="/schedule" element={<MySchedule />} />
          <Route path="/transcript" element={<Transcript />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </AppShell>
    </ProtectedRoute>
  );
}

export default App;
