import { Card } from '@slms/ui';
import { useAuth } from '@slms/auth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>Willkommen, {user?.firstName}!</h2>

      <div className="stats-grid">
        <Card title="Studierende">
          <div className="stat-value">--</div>
          <div className="stat-label">Aktive Einschreibungen</div>
        </Card>

        <Card title="Lerngelegenheiten">
          <div className="stat-value">--</div>
          <div className="stat-label">Laufendes Semester</div>
        </Card>

        <Card title="Anmeldungen">
          <div className="stat-value">--</div>
          <div className="stat-label">Offene Anmeldungen</div>
        </Card>

        <Card title="Warteliste">
          <div className="stat-value">--</div>
          <div className="stat-label">Studierende auf Warteliste</div>
        </Card>
      </div>

      <Card title="Letzte Aktivitäten">
        <p>Keine aktuellen Aktivitäten.</p>
      </Card>
    </div>
  );
}
