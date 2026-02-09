import { useState } from 'react'

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'twitter', label: 'Twitter / X', icon: '🐦' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' }
]

function SocialModal({ client, socials, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    platform: '',
    username: '',
    url: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await fetch(`/api/clients/${client.id}/socials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      setFormData({ platform: '', username: '', url: '' })
      onUpdate()
      window.location.reload()
    } catch (error) {
      console.error('Errore aggiunta social:', error)
    }
  }

  const handleDelete = async (socialId) => {
    if (!confirm('Sei sicuro di voler eliminare questo social?')) return

    try {
      await fetch(`/api/clients/${client.id}/socials/${socialId}`, {
        method: 'DELETE'
      })
      onUpdate()
      window.location.reload()
    } catch (error) {
      console.error('Errore eliminazione social:', error)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Gestione Social - {client.name}</h2>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Social Attivi</h3>
          {socials.length === 0 ? (
            <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '1rem' }}>
              Nessun social configurato
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {socials.map(social => {
                const platform = PLATFORMS.find(p => p.value === social.platform)
                return (
                  <div
                    key={social.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'var(--bg)',
                      borderRadius: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{platform?.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{platform?.label}</div>
                        {social.username && (
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                            @{social.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(social.id)}
                    >
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Aggiungi Social</h3>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label className="form-label">Piattaforma *</label>
              <select
                className="form-select"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                required
              >
                <option value="">Seleziona piattaforma</option>
                {PLATFORMS.map(platform => (
                  <option key={platform.value} value={platform.value}>
                    {platform.icon} {platform.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Chiudi
              </button>
              <button type="submit" className="btn btn-primary">
                ➕ Aggiungi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SocialModal
