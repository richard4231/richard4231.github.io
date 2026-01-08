import { useState, useEffect } from 'react';
import { DataTable, Card, Badge, Button } from '@slms/ui';
import type { LearningOpportunity, LOStatus } from '@slms/types';

const statusLabels: Record<LOStatus, string> = {
  draft: 'Entwurf',
  published: 'Veröffentlicht',
  registration_open: 'Anmeldung offen',
  ongoing: 'Laufend',
  completed: 'Abgeschlossen',
  cancelled: 'Abgesagt',
};

export function MyLearningOpportunities() {
  const [los, setLOs] = useState<LearningOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const isEditable = (lo: LearningOpportunity) => {
    if (!lo.lecturerEditStart || !lo.lecturerEditEnd) return false;
    const now = new Date();
    return now >= new Date(lo.lecturerEditStart) && now <= new Date(lo.lecturerEditEnd);
  };

  const columns = [
    { key: 'moduleId', header: 'Modul' }, // TODO: Resolve name
    { key: 'track', header: 'Schiene' },
    {
      key: 'participants',
      header: 'Teilnehmer',
      render: (lo: LearningOpportunity) =>
        `${lo.currentParticipantCount || 0}/${lo.maxParticipants || '∞'}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (lo: LearningOpportunity) => (
        <Badge variant={lo.status === 'ongoing' ? 'success' : 'default'}>
          {statusLabels[lo.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (lo: LearningOpportunity) => (
        <div className="action-buttons">
          <Button variant="secondary" size="sm">Teilnehmer</Button>
          {isEditable(lo) && (
            <Button variant="primary" size="sm">Bearbeiten</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="my-los">
      <div className="page-header">
        <h2>Meine Lerngelegenheiten</h2>
      </div>

      <Card>
        <DataTable
          data={los}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Lerngelegenheiten zugewiesen"
        />
      </Card>
    </div>
  );
}
