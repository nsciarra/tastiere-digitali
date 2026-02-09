import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutte le attività
router.get('/', (req, res) => {
  try {
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

    const tasks = db.prepare(query).all(...params);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET attività in scadenza (prossimi 7 giorni)
router.get('/upcoming', (req, res) => {
  try {
    const tasks = db.prepare(`
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
    `).all();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET singola attività
router.get('/:id', (req, res) => {
  try {
    const task = db.prepare(`
      SELECT
        t.*,
        c.name as campaign_name,
        cl.name as client_name
      FROM tasks t
      JOIN campaigns c ON t.campaign_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE t.id = ?
    `).get(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crea attività
router.post('/', (req, res) => {
  try {
    const { campaign_id, title, description, due_date, priority, status, assigned_to } = req.body;

    if (!campaign_id || !title) {
      return res.status(400).json({ error: 'campaign_id e title sono obbligatori' });
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (campaign_id, title, description, due_date, priority, status, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      campaign_id,
      title,
      description,
      due_date,
      priority || 'medium',
      status || 'todo',
      assigned_to
    );

    const task = db.prepare(`
      SELECT
        t.*,
        c.name as campaign_name,
        cl.name as client_name
      FROM tasks t
      JOIN campaigns c ON t.campaign_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE t.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT aggiorna attività
router.put('/:id', (req, res) => {
  try {
    const { title, description, due_date, priority, status, assigned_to } = req.body;

    // Se lo status cambia a "completed", imposta completed_at
    const completedAt = status === 'completed' ? new Date().toISOString() : null;

    const stmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, assigned_to = ?,
          completed_at = COALESCE(?, completed_at), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(title, description, due_date, priority, status, assigned_to, completedAt, req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    const task = db.prepare(`
      SELECT
        t.*,
        c.name as campaign_name,
        cl.name as client_name
      FROM tasks t
      JOIN campaigns c ON t.campaign_id = c.id
      JOIN clients cl ON c.client_id = cl.id
      WHERE t.id = ?
    `).get(req.params.id);

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE elimina attività
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Attività non trovata' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
