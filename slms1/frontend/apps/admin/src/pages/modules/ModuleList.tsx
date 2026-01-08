import { useState, useEffect } from 'react';
import { DataTable, Button, Card } from '@slms/ui';
import type { Module } from '@slms/types';

export function ModuleList() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'nameDe', header: 'Name' },
    { key: 'ectsCredits', header: 'ECTS' },
    { key: 'level', header: 'Stufe' },
    {
      key: 'isActive',
      header: 'Status',
      render: (m: Module) => (m.isActive ? 'Aktiv' : 'Inaktiv'),
    },
  ];

  return (
    <div className="module-list">
      <div className="page-header">
        <h2>Module</h2>
        <Button variant="primary">Neues Modul</Button>
      </div>

      <Card>
        <DataTable
          data={modules}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Module gefunden"
          onRowClick={(module) => console.log('Navigate to', module.id)}
        />
      </Card>
    </div>
  );
}
