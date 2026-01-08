import { Card } from '@slms/ui';
import { useAuth } from '@slms/auth';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>Willkommen, {user?.firstName}!</h2>

      <div className="stats-grid">
        <Card title="Aktuelle Anmeldungen">
          <div className="stat-value">--</div>
          <div className="stat-label">Lerngelegenheiten</div>
        </Card>

        <Card title="Warteliste">
          <div className="stat-value">--</div>
          <div className="stat-label">Offene Plätze</div>
        </Card>

        <Card title="ECTS">
          <div className="stat-value">--</div>
          <div className="stat-label">Erreichte Credits</div>
        </Card>

        <Card title="Nächster Termin">
          <div className="stat-value">--</div>
          <div className="stat-label">Heute</div>
        </Card>
      </div>

      <Card title="Kommende Termine">
        <p>Keine anstehenden Termine.</p>
      </Card>

      <Card title="Offene Anmeldungen">
        <p>Keine offenen Anmeldungen.</p>
      </Card>
    </div>
  );
}
