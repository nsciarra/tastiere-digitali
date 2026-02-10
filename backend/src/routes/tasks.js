import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutte le attività
router.get('/', (req, res) => {
  const { campaignId, status, priority } = req.query;
  let query = `
    SELECT
      t.*,
      c.name as campaign_name,
      cl.name as client_name
    FROM tasks t
    JOIN campaigns c ON t.campaign_id = c.id
    JOIN clients cl ON c.client_id = cl.id
  `;

  const conditions = [];
  const params = [];

  if (campaignId) {
    conditions.push('t.campaign_id = ?');
    params.push(campaignId);
  }

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY t.due_date ASC, t.priority DESC';

  db.all(query, params, (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tasks);
  });
});

// GET attività in scadenza (prossimi 7 giorni)
router.get('/upcoming', (req, res) => {
  const query = `
    SELECT
      t.*,
      c.name as campaign_name,
      cl.name as client_name
    FROM tasks t
    JOIN campaigns c ON t.campaign_id = c.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE t.status != 'completed'
      AND t.due_date IS NOT NULL
      AND date(t.due_date) <= date('now', '+7 days')
    ORDER BY t.due_date ASC
  `;

  db.all(query, [], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(tasks);
  });
});

// GET singola attività
router.get('/:id', (req, res) => {
  const query = `
    SELECT
      t.*,
      c.name as campaign_name,
      cl.name as client_name
    FROM tasks t
    JOIN campaigns c ON t.campaign_id = c.id
    JOIN clients cl ON c.client_id = cl.id
    WHERE t.id = ?
  `;

  db.get(query, [req.params.id], (err, task) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!task) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }
    res.json(task);
  });
});

// POST crea attività
router.post('/', (req, res) => {
  const { campaign_id, title, description, due_date, priority, status, assigned_to } = req.body;

  if (!campaign_id || !title) {
    return res.status(400).json({ error: 'campaign_id e title sono obbligatori' });
  }

  db.run(
    `INSERT INTO tasks (campaign_id, title, description, due_date, priority, status, assigned_to)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [campaign_id, title, description, due_date, priority || 'medium', status || 'todo', assigned_to],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const query = `
        SELECT
          t.*,
          c.name as campaign_name,
          cl.name as client_name
        FROM tasks t
        JOIN campaigns c ON t.campaign_id = c.id
        JOIN clients cl ON c.client_id = cl.id
        WHERE t.id = ?
      `;

      db.get(query, [this.lastID], (err, task) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(task);
      });
    }
  );
});

// PUT aggiorna attività
router.put('/:id', (req, res) => {
  const { title, description, due_date, priority, status, assigned_to } = req.body;

  // Se lo status cambia a "completed", imposta completed_at
  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  db.run(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, assigned_to = ?,
         completed_at = COALESCE(?, completed_at), updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, due_date, priority, status, assigned_to, completedAt, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Attività non trovata' });
      }

      const query = `
        SELECT
          t.*,
          c.name as campaign_name,
          cl.name as client_name
        FROM tasks t
        JOIN campaigns c ON t.campaign_id = c.id
        JOIN clients cl ON c.client_id = cl.id
        WHERE t.id = ?
      `;

      db.get(query, [req.params.id], (err, task) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(task);
      });
    }
  );
});

// DELETE elimina attività
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    res.status(204).send();
  });
});

export default router;
