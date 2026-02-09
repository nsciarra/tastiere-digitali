import { useState, useEffect } from 'react'

function TaskModal({ task, campaigns, onSave, onClose }) {
  const [formData, setFormData] = useState({
    campaign_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'todo',
    assigned_to: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        campaign_id: task.campaign_id,
        title: task.title,
        description: task.description || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority,
        status: task.status,
        assigned_to: task.assigned_to || ''
      })
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {task ? 'Modifica Attività' : 'Nuova Attività'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Campagna *</label>
            <select
              name="campaign_id"
              className="form-select"
              value={formData.campaign_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona campagna</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.client_name})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Titolo *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descrizione</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data Scadenza</label>
            <input
              type="date"
              name="due_date"
              className="form-input"
              value={formData.due_date}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priorità</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">⬇️ Bassa</option>
                <option value="medium">➡️ Media</option>
                <option value="high">⬆️ Alta</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Stato</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="todo">Da Fare</option>
                <option value="in_progress">In Corso</option>
                <option value="completed">Completata</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assegnata a</label>
            <input
              type="text"
              name="assigned_to"
              className="form-input"
              value={formData.assigned_to}
              onChange={handleChange}
              placeholder="Nome del responsabile"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskModal
