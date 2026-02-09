import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutti i clienti
router.get('/', (req, res) => {
  try {
    const clients = db.prepare('SELECT * FROM clients ORDER BY name').all();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET singolo cliente
router.get('/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crea cliente
router.post('/', (req, res) => {
  try {
    const { name, email, phone, website, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Il nome è obbligatorio' });
    }

    const stmt = db.prepare(`
      INSERT INTO clients (name, email, phone, website, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, phone, website, notes);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT aggiorna cliente
router.put('/:id', (req, res) => {
  try {
    const { name, email, phone, website, notes } = req.body;

    const stmt = db.prepare(`
      UPDATE clients
      SET name = ?, email = ?, phone = ?, website = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(name, email, phone, website, notes, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina cliente
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM clients WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET social networks di un cliente
router.get('/:id/socials', (req, res) => {
  try {
    const socials = db.prepare('SELECT * FROM client_socials WHERE client_id = ?').all(req.params.id);
    res.json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST aggiungi social network a cliente
router.post('/:id/socials', (req, res) => {
  try {
    const { platform, username, url } = req.body;
    const clientId = req.params.id;

    if (!platform) {
      return res.status(400).json({ error: 'La piattaforma è obbligatoria' });
    }

    const stmt = db.prepare(`
      INSERT INTO client_socials (client_id, platform, username, url)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(clientId, platform, username, url);
    const social = db.prepare('SELECT * FROM client_socials WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json(social);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Questo social è già presente per il cliente' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT aggiorna social network
router.put('/:clientId/socials/:socialId', (req, res) => {
  try {
    const { platform, username, url, active } = req.body;

    const stmt = db.prepare(`
      UPDATE client_socials
      SET platform = ?, username = ?, url = ?, active = ?
      WHERE id = ? AND client_id = ?
    `);

    const result = stmt.run(platform, username, url, active ? 1 : 0, req.params.socialId, req.params.clientId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Social non trovato' });
    }

    const social = db.prepare('SELECT * FROM client_socials WHERE id = ?').get(req.params.socialId);
    res.json(social);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina social network
router.delete('/:clientId/socials/:socialId', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM client_socials WHERE id = ? AND client_id = ?');
    const result = stmt.run(req.params.socialId, req.params.clientId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Social non trovato' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
