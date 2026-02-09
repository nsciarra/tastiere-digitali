import { useState, useEffect } from 'react'

function CampaignModal({ campaign, clients, onSave, onClose }) {
  const [formData, setFormData] = useState({
    client_id: '',
    social_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning',
    budget: ''
  })
  const [clientSocials, setClientSocials] = useState([])

  useEffect(() => {
    if (campaign) {
      setFormData({
        client_id: campaign.client_id,
        social_id: campaign.social_id,
        name: campaign.name,
        description: campaign.description || '',
        start_date: campaign.start_date || '',
        end_date: campaign.end_date || '',
        status: campaign.status,
        budget: campaign.budget || ''
      })
      loadClientSocials(campaign.client_id)
    }
  }, [campaign])

  const loadClientSocials = async (clientId) => {
    if (!clientId) return
    try {
      const response = await fetch(`/api/clients/${clientId}/socials`)
      const socials = await response.json()
      setClientSocials(socials)
    } catch (error) {
      console.error('Errore caricamento social:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'client_id') {
      loadClientSocials(value)
      setFormData(prev => ({ ...prev, social_id: '' }))
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {campaign ? 'Modifica Campagna' : 'Nuova Campagna'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Cliente *</label>
            <select
              name="client_id"
              className="form-select"
              value={formData.client_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Social Network *</label>
            <select
              name="social_id"
              className="form-select"
              value={formData.social_id}
              onChange={handleChange}
              required
              disabled={!formData.client_id}
            >
              <option value="">Seleziona social</option>
              {clientSocials.map(social => (
                <option key={social.id} value={social.id}>
                  {social.platform} {social.username ? `(@${social.username})` : ''}
                </option>
              ))}
            </select>
            {formData.client_id && clientSocials.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--warning)', marginTop: '0.25rem' }}>
                ⚠️ Nessun social configurato per questo cliente
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nome Campagna *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data Inizio</label>
              <input
                type="date"
                name="start_date"
                className="form-input"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data Fine</label>
              <input
                type="date"
                name="end_date"
                className="form-input"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Stato</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="planning">Pianificazione</option>
                <option value="active">Attiva</option>
                <option value="paused">In Pausa</option>
                <option value="completed">Completata</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Budget (€)</label>
              <input
                type="number"
                name="budget"
                className="form-input"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
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

export default CampaignModal
