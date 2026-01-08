import { useState, useEffect } from 'react';
import { DataTable, Card, Badge } from '@slms/ui';

interface TranscriptEntry {
  id: string;
  moduleCode: string;
  moduleName: string;
  semester: string;
  grade: number | null;
  ects: number;
  status: 'passed' | 'failed' | 'in_progress';
}

export function Transcript() {
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const totalEcts = entries
    .filter(e => e.status === 'passed')
    .reduce((sum, e) => sum + e.ects, 0);

  const columns = [
    { key: 'moduleCode', header: 'Code' },
    { key: 'moduleName', header: 'Modul' },
    { key: 'semester', header: 'Semester' },
    { key: 'ects', header: 'ECTS' },
    {
      key: 'grade',
      header: 'Note',
      render: (e: TranscriptEntry) => e.grade?.toFixed(1) ?? '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (e: TranscriptEntry) => {
        const labels = { passed: 'Bestanden', failed: 'Nicht bestanden', in_progress: 'Laufend' };
        const variants = { passed: 'success', failed: 'danger', in_progress: 'warning' } as const;
        return <Badge variant={variants[e.status]}>{labels[e.status]}</Badge>;
      },
    },
  ];

  return (
    <div className="transcript">
      <div className="page-header">
        <h2>Notenspiegel</h2>
      </div>

      <div className="stats-grid">
        <Card title="Erreichte ECTS">
          <div className="stat-value">{totalEcts}</div>
        </Card>
        <Card title="Durchschnitt">
          <div className="stat-value">--</div>
        </Card>
      </div>

      <Card>
        <DataTable
          data={entries}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Einträge vorhanden"
        />
      </Card>
    </div>
  );
}
