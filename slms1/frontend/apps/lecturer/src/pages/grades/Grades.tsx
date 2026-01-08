import { useState, useEffect } from 'react';
import { DataTable, Card, Button, Input, Select } from '@slms/ui';

interface GradeEntry {
  id: string;
  studentId: string;
  studentName: string;
  matriculationNumber: string;
  grade: number | null;
  status: 'pending' | 'entered' | 'verified';
}

export function Grades() {
  const [entries, setEntries] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState('');

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, [selectedAssessment]);

  const handleGradeChange = (entryId: string, grade: string) => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 1 || numGrade > 6) return;

    setEntries(prev =>
      prev.map(e => e.id === entryId ? { ...e, grade: numGrade } : e)
    );
  };

  const handleSave = () => {
    // TODO: API call to save grades
    console.log('Save grades:', entries);
  };

  const columns = [
    { key: 'matriculationNumber', header: 'Matrikelnr.' },
    { key: 'studentName', header: 'Name' },
    {
      key: 'grade',
      header: 'Note (1.0 - 6.0)',
      render: (e: GradeEntry) => (
        <Input
          type="number"
          min="1"
          max="6"
          step="0.1"
          value={e.grade?.toString() || ''}
          onChange={(ev) => handleGradeChange(e.id, ev.target.value)}
          style={{ width: '80px' }}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (e: GradeEntry) => {
        const labels = { pending: 'Offen', entered: 'Erfasst', verified: 'Verifiziert' };
        return labels[e.status];
      },
    },
  ];

  return (
    <div className="grades">
      <div className="page-header">
        <h2>Notenerfassung</h2>
        <Button variant="primary" onClick={handleSave}>Speichern</Button>
      </div>

      <Card>
        <div className="filter-bar">
          <Select
            label="Leistungsnachweis"
            options={[{ value: '', label: 'Bitte wählen...' }]}
            value={selectedAssessment}
            onChange={setSelectedAssessment}
          />
        </div>

        {selectedAssessment ? (
          <DataTable
            data={entries}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyMessage="Keine Studierenden registriert"
          />
        ) : (
          <p className="empty-message">Bitte wählen Sie einen Leistungsnachweis aus.</p>
        )}
      </Card>
    </div>
  );
}
