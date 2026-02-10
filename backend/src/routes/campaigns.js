import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutte le campagne con dettagli cliente e social
router.get('/', (req, res) => {
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

  db.all(query, params, (err, campaigns) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(campaigns);
  });
});

// GET singola campagna
router.get('/:id', (req, res) => {
  const query = `
    SELECT
      c.*,
      cl.name as client_name,
      cs.platform as social_platform,
      cs.username as social_username
    FROM campaigns c
    JOIN clients cl ON c.client_id = cl.id
    JOIN client_socials cs ON c.social_id = cs.id
    WHERE c.id = ?
  `;

  db.get(query, [req.params.id], (err, campaign) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!campaign) {
      return res.status(404).json({ error: 'Campagna non trovata' });
    }
    res.json(campaign);
  });
});

// POST crea campagna
router.post('/', (req, res) => {
  const { client_id, social_id, name, description, start_date, end_date, status, budget } = req.body;

  if (!client_id || !social_id || !name) {
    return res.status(400).json({ error: 'client_id, social_id e name sono obbligatori' });
  }

  db.run(
    `INSERT INTO campaigns (client_id, social_id, name, description, start_date, end_date, status, budget)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [client_id, social_id, name, description, start_date, end_date, status || 'planning', budget],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const query = `
        SELECT
          c.*,
          cl.name as client_name,
          cs.platform as social_platform
        FROM campaigns c
        JOIN clients cl ON c.client_id = cl.id
        JOIN client_socials cs ON c.social_id = cs.id
        WHERE c.id = ?
      `;

      db.get(query, [this.lastID], (err, campaign) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(campaign);
      });
    }
  );
});

// PUT aggiorna campagna
router.put('/:id', (req, res) => {
  const { name, description, start_date, end_date, status, budget } = req.body;

  db.run(
    `UPDATE campaigns
     SET name = ?, description = ?, start_date = ?, end_date = ?, status = ?, budget = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, description, start_date, end_date, status, budget, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Campagna non trovata' });
      }

      const query = `
        SELECT
          c.*,
          cl.name as client_name,
          cs.platform as social_platform
        FROM campaigns c
        JOIN clients cl ON c.client_id = cl.id
        JOIN client_socials cs ON c.social_id = cs.id
        WHERE c.id = ?
      `;

      db.get(query, [req.params.id], (err, campaign) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(campaign);
      });
    }
  );
});

// DELETE elimina campagna
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM campaigns WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Campagna non trovata' });
    }

    res.status(204).send();
  });
});

export default router;
