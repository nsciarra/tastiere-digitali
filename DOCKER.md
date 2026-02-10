# 🐳 Social Campaign Manager - Docker Setup

## Avvio Rapido

### Prerequisiti
- Docker Desktop installato
- Docker Compose installato

### Installazione

1. **Clona il repository**
```bash
git clone https://github.com/nsciarra/tastiere-digitali.git
cd tastiere-digitali
git checkout claude/social-campaign-manager-Xi90s
```

2. **Avvia con Docker Compose**
```bash
docker-compose up -d
```

3. **Apri il browser**
```
http://localhost
```

L'applicazione è pronta! 🎉

### Comandi Utili

```bash
# Avvia i container
docker-compose up -d

# Ferma i container
docker-compose down

# Vedi i logs
docker-compose logs -f

# Riavvia
docker-compose restart

# Ricostruisci le immagini
docker-compose up -d --build

# Vedi lo stato
docker-compose ps
```

### Porte

- **Frontend**: http://localhost (porta 80)
- **Backend API**: http://localhost:3000

### Backup Database

Il database è salvato in un volume Docker persistente. Per fare backup:

```bash
# Backup
docker cp tastiere-digitali-backend:/app/data/database.sqlite ./backup.sqlite

# Restore
docker cp ./backup.sqlite tastiere-digitali-backend:/app/data/database.sqlite
docker-compose restart backend
```

### Aggiornamenti

Per aggiornare l'applicazione:

```bash
git pull origin claude/social-campaign-manager-Xi90s
docker-compose down
docker-compose up -d --build
```

## Sviluppo Locale (senza Docker)

Se preferisci eseguire l'app in modalità sviluppo:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Struttura

```
tastiere-digitali/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   └── package.json
└── docker-compose.yml
```

## Supporto

Per problemi o domande, contatta il team di Tastiere Digitali.

---

Made with 💜 by Tastiere Digitali
