# SLMS - Student Lifecycle Management System

Ein modulares System für das Lifecycle-Management von Studierenden an Schweizer Hochschulen.

## Tech Stack

- **Backend**: Python 3.11+ / FastAPI / SQLAlchemy / PostgreSQL
- **Frontend**: React 18 / TypeScript / Vite / Turborepo
- **Auth**: SWITCH edu-ID (OIDC)
- **Hosting**: Swiss Cloud (Exoscale/Infomaniak)

## Projektstruktur

```
slms/
├── backend/              # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/       # REST API Endpoints
│   │   ├── models/       # SQLAlchemy Models
│   │   ├── services/     # Business Logic
│   │   └── core/         # Auth, Security
│   ├── alembic/          # Database Migrations
│   └── tests/
│
├── frontend/             # React Monorepo (Turborepo)
│   ├── apps/
│   │   ├── admin/        # Power User Frontend
│   │   ├── student/      # Studierenden Portal
│   │   └── lecturer/     # Dozierenden Portal
│   └── packages/
│       ├── ui/           # Shared Components
│       ├── auth/         # Auth Logic
│       └── types/        # TypeScript Types
│
└── infrastructure/       # Deployment Config
```

## Quick Start

### Backend

```bash
cd backend
poetry install
cp .env.example .env
# Edit .env with your settings

# Start PostgreSQL (Docker)
docker-compose up -d db

# Run migrations
poetry run alembic upgrade head

# Start server
poetry run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev:admin    # Admin auf http://localhost:3000
pnpm dev:student  # Student auf http://localhost:3001
pnpm dev:lecturer # Lecturer auf http://localhost:3002
```

## Features

### Power User (Admin)
- Studierendenverwaltung
- Modulverwaltung mit Voraussetzungen
- Lerngelegenheiten (Schienen A/B/C/D)
- Raumplanung
- Reports & Exporte

### Studierenden-Portal
- Modulkatalog & Suche
- Anmeldung mit Berechtigungsprüfung
- Warteliste
- Stundenplan
- Notenspiegel

### Dozierenden-Portal
- Eigene Lerngelegenheiten bearbeiten
- Teilnehmerliste
- Teilnahme markieren (teilgenommen/ausgeschlossen/abgemeldet)
- Wartelisten-Management

## Compliance

- Swiss nDSG (Datenschutzgesetz)
- GDPR-kompatibel
- Audit-Logging
- Verschlüsselung at rest & in transit

## License

Proprietary - All rights reserved
