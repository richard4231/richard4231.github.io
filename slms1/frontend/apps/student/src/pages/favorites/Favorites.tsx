import { useState, useEffect } from 'react';
import { Card, Button } from '@slms/ui';

interface Favorite {
  id: string;
  entityType: 'module' | 'learning_opportunity';
  entityId: string;
  name: string;
  description?: string;
}

export function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="favorites">
      <div className="page-header">
        <h2>Meine Favoriten</h2>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <p>Keine Favoriten gespeichert.</p>
          <p>Markiere Module oder Lerngelegenheiten als Favorit, um sie hier zu sehen.</p>
        </Card>
      ) : (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <Card key={fav.id} title={fav.name}>
              <p>{fav.description || 'Keine Beschreibung'}</p>
              <div className="card-actions">
                <Button variant="primary" size="sm">Anzeigen</Button>
                <Button variant="ghost" size="sm">Entfernen</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
