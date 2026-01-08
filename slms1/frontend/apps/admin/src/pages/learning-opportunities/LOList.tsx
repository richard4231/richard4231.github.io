import { useState, useEffect } from 'react';
import { DataTable, Button, Card, Badge } from '@slms/ui';
import type { LearningOpportunity, LOStatus } from '@slms/types';

const statusLabels: Record<LOStatus, string> = {
  draft: 'Entwurf',
  published: 'Veröffentlicht',
  registration_open: 'Anmeldung offen',
  ongoing: 'Laufend',
  completed: 'Abgeschlossen',
  cancelled: 'Abgesagt',
};

export function LOList() {
  const [los, setLOs] = useState<LearningOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const columns = [
    { key: 'moduleId', header: 'Modul' },  // TODO: Resolve to module name
    { key: 'track', header: 'Schiene' },
    {
      key: 'maxParticipants',
      header: 'Kapazität',
      render: (lo: LearningOpportunity) =>
        lo.maxParticipants ? `${lo.currentParticipantCount || 0}/${lo.maxParticipants}` : 'Unbegrenzt',
    },
    {
      key: 'status',
      header: 'Status',
      render: (lo: LearningOpportunity) => (
        <Badge variant={lo.status === 'registration_open' ? 'success' : 'default'}>
          {statusLabels[lo.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="lo-list">
      <div className="page-header">
        <h2>Lerngelegenheiten</h2>
        <Button variant="primary">Neue Lerngelegenheit</Button>
      </div>

      <Card>
        <DataTable
          data={los}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Lerngelegenheiten gefunden"
          onRowClick={(lo) => console.log('Navigate to', lo.id)}
        />
      </Card>
    </div>
  );
}
