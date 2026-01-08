import { useState, useEffect } from 'react';
import { DataTable, Button, Card } from '@slms/ui';
import type { Student } from '@slms/types';

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const columns = [
    { key: 'matriculationNumber', header: 'Matrikelnr.' },
    { key: 'lastName', header: 'Nachname' },
    { key: 'firstName', header: 'Vorname' },
    { key: 'status', header: 'Status' },
    { key: 'enrollmentDate', header: 'Eingeschrieben seit' },
  ];

  return (
    <div className="student-list">
      <div className="page-header">
        <h2>Studierende</h2>
        <Button variant="primary">Neuer Studierender</Button>
      </div>

      <Card>
        <DataTable
          data={students}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Studierenden gefunden"
          onRowClick={(student) => console.log('Navigate to', student.id)}
        />
      </Card>
    </div>
  );
}
