import { Card } from '@slms/ui';
import { useAuth } from '@slms/auth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>Willkommen, {user?.firstName}!</h2>

      <div className="stats-grid">
        <Card title="Meine Lerngelegenheiten">
          <div className="stat-value">--</div>
          <div className="stat-label">Aktuelles Semester</div>
        </Card>

        <Card title="Angemeldete Studierende">
          <div className="stat-value">--</div>
          <div className="stat-label">Gesamt</div>
        </Card>

        <Card title="Warteliste">
          <div className="stat-value">--</div>
          <div className="stat-label">Wartende</div>
        </Card>

        <Card title="Offene Benotungen">
          <div className="stat-value">--</div>
          <div className="stat-label">Zu erfassen</div>
        </Card>
      </div>

      <Card title="Heutige Termine">
        <p>Keine Termine heute.</p>
      </Card>

      <Card title="Aktionen erforderlich">
        <p>Keine offenen Aktionen.</p>
      </Card>
    </div>
  );
}
