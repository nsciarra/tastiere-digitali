import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutte le campagne con dettagli cliente e social
router.get('/', (req, res) => {
  try {
    const { clientId, status } = req.query;
    let query = `
      SELECT
        c.*,
        cl.name as client_name,
        cs.platform as social_platform,
        cs.username as social_username
      FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      JOIN client_socials cs ON c.social_id = cs.id
    `;

    const conditions = [];
    const params = [];

    if (clientId) {
      conditions.push('c.client_id = ?');
      params.push(clientId);
    }

    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.start_date DESC';

    const campaigns = db.prepare(query).all(...params);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET singola campagna
router.get('/:id', (req, res) => {
  try {
    const campaign = db.prepare(`
      SELECT
        c.*,
        cl.name as client_name,
        cs.platform as social_platform,
        cs.username as social_username
      FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      JOIN client_socials cs ON c.social_id = cs.id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campagna non trovata' });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crea campagna
router.post('/', (req, res) => {
  try {
    const { client_id, social_id, name, description, start_date, end_date, status, budget } = req.body;

    if (!client_id || !social_id || !name) {
      return res.status(400).json({ error: 'client_id, social_id e name sono obbligatori' });
    }

    const stmt = db.prepare(`
      INSERT INTO campaigns (client_id, social_id, name, description, start_date, end_date, status, budget)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(client_id, social_id, name, description, start_date, end_date, status || 'planning', budget);
    const campaign = db.prepare(`
      SELECT
        c.*,
        cl.name as client_name,
        cs.platform as social_platform
      FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      JOIN client_socials cs ON c.social_id = cs.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT aggiorna campagna
router.put('/:id', (req, res) => {
  try {
    const { name, description, start_date, end_date, status, budget } = req.body;

    const stmt = db.prepare(`
      UPDATE campaigns
      SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, budget = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(name, description, start_date, end_date, status, budget, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Campagna non trovata' });
    }

    const campaign = db.prepare(`
      SELECT
        c.*,
        cl.name as client_name,
        cs.platform as social_platform
      FROM campaigns c
      JOIN clients cl ON c.client_id = cl.id
      JOIN client_socials cs ON c.social_id = cs.id
      WHERE c.id = ?
    `).get(req.params.id);

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina campagna
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM campaigns WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Campagna non trovata' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
