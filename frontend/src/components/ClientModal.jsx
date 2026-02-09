import { useState, useEffect } from 'react'

function ClientModal({ client, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    notes: ''
  })

  useEffect(() => {
    if (client) {
      setFormData(client)
    }
  }, [client])

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
            {client ? 'Modifica Cliente' : 'Nuovo Cliente'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Nome *</label>
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
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefono</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sito Web</label>
            <input
              type="url"
              name="website"
              className="form-input"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note</label>
            <textarea
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
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

export default ClientModal
