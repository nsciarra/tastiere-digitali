# Social Campaign Manager - Tastiere Digitali

Applicazione web per la gestione delle campagne social dei clienti di Tastiere Digitali.

## Funzionalità

- 📋 Gestione clienti
- 📱 Gestione social network per cliente (Facebook, Instagram, LinkedIn, Twitter, TikTok)
- 📅 Pianificazione campagne social
- ✅ Gestione attività con scadenze
- 📊 Dashboard per monitoraggio stato campagne
- 🔔 Notifiche per scadenze imminenti

## Struttura del Progetto

```
├── backend/     # API Server (Node.js + Express + SQLite)
├── frontend/    # UI Web (React + Vite)
└── README.md
```

## Requisiti

- Node.js >= 18
- npm >= 9

## Installazione

```bash
# Installa dipendenze backend
cd backend
npm install

# Installa dipendenze frontend
cd ../frontend
npm install
```

## Avvio Sviluppo

### Backend (porta 3000)
```bash
cd backend
npm run dev
```

### Frontend (porta 5173)
```bash
cd frontend
npm run dev
```

## Build Produzione

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## API Endpoints

### Clienti
- `GET /api/clients` - Lista clienti
- `POST /api/clients` - Crea cliente
- `PUT /api/clients/:id` - Aggiorna cliente
- `DELETE /api/clients/:id` - Elimina cliente

### Social Network
- `GET /api/clients/:id/socials` - Lista social del cliente
- `POST /api/clients/:id/socials` - Aggiungi social al cliente

### Campagne
- `GET /api/campaigns` - Lista campagne
- `POST /api/campaigns` - Crea campagna
- `PUT /api/campaigns/:id` - Aggiorna campagna
- `DELETE /api/campaigns/:id` - Elimina campagna

### Attività
- `GET /api/tasks` - Lista attività
- `POST /api/tasks` - Crea attività
- `PUT /api/tasks/:id` - Aggiorna attività
- `DELETE /api/tasks/:id` - Elimina attività

## Licenza

MIT
