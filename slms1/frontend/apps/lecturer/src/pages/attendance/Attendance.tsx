import { useState, useEffect } from 'react';
import { DataTable, Card, Button, Badge, Select } from '@slms/ui';
import type { Registration, AttendanceStatus } from '@slms/types';

const attendanceOptions = [
  { value: '', label: 'Status wählen...' },
  { value: 'attended', label: 'Teilgenommen' },
  { value: 'excluded', label: 'Ausgeschlossen' },
  { value: 'withdrawn', label: 'Abgemeldet' },
];

const statusVariants: Record<AttendanceStatus, 'success' | 'danger' | 'warning'> = {
  attended: 'success',
  excluded: 'danger',
  withdrawn: 'warning',
};

const statusLabels: Record<AttendanceStatus, string> = {
  attended: 'Teilgenommen',
  excluded: 'Ausgeschlossen',
  withdrawn: 'Abgemeldet',
};

export function Attendance() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLO, setSelectedLO] = useState('');

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, [selectedLO]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    // TODO: API call to update attendance
    console.log('Update attendance:', studentId, status);
  };

  const columns = [
    { key: 'studentId', header: 'Matrikelnr.' }, // TODO: Resolve
    { key: 'studentName', header: 'Name' }, // TODO: Add
    { key: 'registrationDate', header: 'Angemeldet am' },
    {
      key: 'attendanceStatus',
      header: 'Status',
      render: (r: Registration) => r.attendanceStatus ? (
        <Badge variant={statusVariants[r.attendanceStatus]}>
          {statusLabels[r.attendanceStatus]}
        </Badge>
      ) : (
        <span className="text-muted">Nicht erfasst</span>
      ),
    },
    {
      key: 'actions',
      header: 'Aktion',
      render: (r: Registration) => (
        <Select
          options={attendanceOptions}
          value={r.attendanceStatus || ''}
          onChange={(value) => handleStatusChange(r.studentId as unknown as string, value as AttendanceStatus)}
        />
      ),
    },
  ];

  return (
    <div className="attendance">
      <div className="page-header">
        <h2>Teilnahme erfassen</h2>
      </div>

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
          <DataTable
            data={registrations}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyMessage="Keine Studierenden angemeldet"
          />
        ) : (
          <p className="empty-message">Bitte wählen Sie eine Lerngelegenheit aus.</p>
        )}
      </Card>
    </div>
  );
}
