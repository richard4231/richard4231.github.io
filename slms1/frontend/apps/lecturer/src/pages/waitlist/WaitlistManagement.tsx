import { useState, useEffect } from 'react';
import { DataTable, Card, Button, Badge, Select, Alert } from '@slms/ui';
import type { WaitlistEntry, WaitlistStatus } from '@slms/types';

const statusLabels: Record<WaitlistStatus, string> = {
  waiting: 'Wartend',
  promoted: 'Nachgerückt',
  expired: 'Abgelaufen',
  declined: 'Abgelehnt',
};

export function WaitlistManagement() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLO, setSelectedLO] = useState('');
  const [threshold] = useState(30); // Default waitlist threshold

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, [selectedLO]);

  const handlePromote = (entryId: string) => {
    // TODO: API call to promote student
    console.log('Promote:', entryId);
  };

  const handleRemove = (entryId: string) => {
    // TODO: API call to remove from waitlist
    console.log('Remove:', entryId);
  };

  const columns = [
    { key: 'position', header: 'Position' },
    { key: 'studentId', header: 'Matrikelnr.' }, // TODO: Resolve
    { key: 'studentName', header: 'Name' }, // TODO: Add
    {
      key: 'addedAt',
      header: 'Hinzugefügt',
      render: (e: WaitlistEntry) => new Date(e.addedAt).toLocaleDateString('de-CH'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e: WaitlistEntry) => (
        <Badge variant={e.status === 'waiting' ? 'warning' : 'default'}>
          {statusLabels[e.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (e: WaitlistEntry) => e.status === 'waiting' && (
        <div className="action-buttons">
          <Button variant="primary" size="sm" onClick={() => handlePromote(e.id)}>
            Nachrücken
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleRemove(e.id)}>
            Entfernen
          </Button>
        </div>
      ),
    },
  ];

  const waitingCount = entries.filter(e => e.status === 'waiting').length;

  return (
    <div className="waitlist-management">
      <div className="page-header">
        <h2>Wartelisten-Management</h2>
      </div>

      <Alert variant="info">
        Die Warteliste wird aktiviert, wenn mehr als {threshold} Anmeldungen eingehen.
        Studierende werden in der Reihenfolge ihrer Anmeldung nachgerückt.
      </Alert>

      <Card>
        <div className="filter-bar">
          <Select
            label="Lerngelegenheit"
            options={[{ value: '', label: 'Bitte wählen...' }]}
            value={selectedLO}
            onChange={setSelectedLO}
          />
        </div>

        {selectedLO ? (
          <>
            <div className="waitlist-stats">
              <strong>{waitingCount}</strong> Studierende auf der Warteliste
            </div>
            <DataTable
              data={entries}
              columns={columns}
              keyField="id"
              loading={loading}
              emptyMessage="Keine Einträge auf der Warteliste"
            />
          </>
        ) : (
          <p className="empty-message">Bitte wählen Sie eine Lerngelegenheit aus.</p>
        )}
      </Card>
    </div>
  );
}
