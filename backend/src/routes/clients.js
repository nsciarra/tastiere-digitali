import express from 'express';
import db from '../database.js';

const router = express.Router();

// GET tutti i clienti
router.get('/', (req, res) => {
  db.all('SELECT * FROM clients ORDER BY name', [], (err, clients) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(clients);
  });
});

// GET singolo cliente
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!client) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }
    res.json(client);
  });
});

// POST crea cliente
router.post('/', (req, res) => {
  const { name, email, phone, website, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Il nome è obbligatorio' });
  }

  db.run(
    'INSERT INTO clients (name, email, phone, website, notes) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, website, notes],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err, client) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(client);
      });
    }
  );
});

// PUT aggiorna cliente
router.put('/:id', (req, res) => {
  const { name, email, phone, website, notes } = req.body;

  db.run(
    `UPDATE clients
     SET name = ?, email = ?, phone = ?, website = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, phone, website, notes, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente non trovato' });
      }

      db.get('SELECT * FROM clients WHERE id = ?', [req.params.id], (err, client) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(client);
      });
    }
  );
});

// DELETE elimina cliente
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM clients WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.status(204).send();
  });
});

// GET social networks di un cliente
router.get('/:id/socials', (req, res) => {
  db.all('SELECT * FROM client_socials WHERE client_id = ?', [req.params.id], (err, socials) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(socials);
  });
});

// POST aggiungi social network a cliente
router.post('/:id/socials', (req, res) => {
  const { platform, username, url } = req.body;
  const clientId = req.params.id;

  if (!platform) {
    return res.status(400).json({ error: 'La piattaforma è obbligatoria' });
  }

  db.run(
    'INSERT INTO client_socials (client_id, platform, username, url) VALUES (?, ?, ?, ?)',
    [clientId, platform, username, url],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Questo social è già presente per il cliente' });
        }
        return res.status(500).json({ error: err.message });
      }

      db.get('SELECT * FROM client_socials WHERE id = ?', [this.lastID], (err, social) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(social);
      });
    }
  );
});

// PUT aggiorna social network
router.put('/:clientId/socials/:socialId', (req, res) => {
  const { platform, username, url, active } = req.body;

  db.run(
    `UPDATE client_socials
     SET platform = ?, username = ?, url = ?, active = ?
     WHERE id = ? AND client_id = ?`,
    [platform, username, url, active ? 1 : 0, req.params.socialId, req.params.clientId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Social non trovato' });
      }

      db.get('SELECT * FROM client_socials WHERE id = ?', [req.params.socialId], (err, social) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(social);
      });
    }
  );
});

// DELETE elimina social network
router.delete('/:clientId/socials/:socialId', (req, res) => {
  db.run(
    'DELETE FROM client_socials WHERE id = ? AND client_id = ?',
    [req.params.socialId, req.params.clientId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Social non trovato' });
      }

      res.status(204).send();
    }
  );
});

export default router;
