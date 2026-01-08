import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@slms/auth';
import { AppShell, Sidebar } from '@slms/ui';
import { Dashboard } from './pages/Dashboard';
import { MyLearningOpportunities } from './pages/learning-opportunities/MyLearningOpportunities';
import { Attendance } from './pages/attendance/Attendance';
import { WaitlistManagement } from './pages/waitlist/WaitlistManagement';
import { Grades } from './pages/grades/Grades';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Meine Lerngelegenheiten', href: '/learning-opportunities' },
  { label: 'Teilnahme', href: '/attendance' },
  { label: 'Warteliste', href: '/waitlist' },
  { label: 'Noten', href: '/grades' },
];

function App() {
  return (
    <ProtectedRoute>
      <AppShell
        sidebar={<Sidebar items={navItems} currentPath={window.location.pathname} />}
        header={<header className="lecturer-header"><h1>Dozierendenportal</h1></header>}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learning-opportunities" element={<MyLearningOpportunities />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/waitlist" element={<WaitlistManagement />} />
          <Route path="/grades" element={<Grades />} />
        </Routes>
      </AppShell>
    </ProtectedRoute>
  );
}

export default App;
