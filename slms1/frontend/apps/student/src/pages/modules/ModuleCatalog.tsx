import { useState, useEffect } from 'react';
import { DataTable, Button, Card, Input } from '@slms/ui';
import type { Module } from '@slms/types';

export function ModuleCatalog() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      key: 'actions',
      header: '',
      render: (m: Module) => (
        <Button variant="secondary" size="sm">Details</Button>
      ),
    },
  ];

  return (
    <div className="module-catalog">
      <div className="page-header">
        <h2>Modulkatalog</h2>
      </div>

      <Card>
        <div className="search-bar">
          <Input
            placeholder="Module suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <DataTable
          data={modules}
          columns={columns}
          keyField="id"
          loading={loading}
          emptyMessage="Keine Module gefunden"
        />
      </Card>
    </div>
  );
}
