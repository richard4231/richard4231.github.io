import { useState, useEffect } from 'react';
import { DataTable, Card, Badge } from '@slms/ui';
import type { Registration, RegistrationStatus } from '@slms/types';

const statusLabels: Record<RegistrationStatus, string> = {
  registered: 'Angemeldet',
  waitlisted: 'Warteliste',
  confirmed: 'Bestätigt',
  withdrawn: 'Abgemeldet',
  excluded: 'Ausgeschlossen',
  completed: 'Abgeschlossen',
};

const statusVariants: Record<RegistrationStatus, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  registered: 'success',
  waitlisted: 'warning',
  confirmed: 'success',
  withdrawn: 'default',
  excluded: 'danger',
  completed: 'info',
};

export function MyRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const columns = [
    { key: 'learningOpportunityId', header: 'Lerngelegenheit' }, // TODO: Resolve name
    { key: 'registrationDate', header: 'Anmeldedatum' },
    {
      key: 'waitlistPosition',
      header: 'Warteliste',
      render: (r: Registration) => r.waitlistPosition ? `Position ${r.waitlistPosition}` : '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: Registration) => (
        <Badge variant={statusVariants[r.status]}>
          {statusLabels[r.status]}
        </Badge>
      ),
    },
  ];

  return (
    <div className="my-registrations">
      <div className="page-header">
        <h2>Meine Anmeldungen</h2>
      </div>

      <Card>
        <DataTable
          data={registrations}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Anmeldungen vorhanden"
        />
      </Card>
    </div>
  );
}
