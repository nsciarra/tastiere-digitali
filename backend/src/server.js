import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientsRouter from './routes/clients.js';
import campaignsRouter from './routes/campaigns.js';
import tasksRouter from './routes/tasks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/tasks', tasksRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Social Campaign Manager API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API documentation available at http://localhost:${PORT}/health`);
});
