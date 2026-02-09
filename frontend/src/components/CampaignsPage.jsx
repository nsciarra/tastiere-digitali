import { useState, useEffect } from 'react'
import CampaignModal from './CampaignModal'

const STATUS_MAP = {
  planning: { label: 'Pianificazione', badge: 'secondary' },
  active: { label: 'Attiva', badge: 'success' },
  paused: { label: 'In Pausa', badge: 'warning' },
  completed: { label: 'Completata', badge: 'primary' }
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [clients, setClients] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterClient, setFilterClient] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filterClient, filterStatus])

  const loadData = async () => {
    try {
      const params = new URLSearchParams()
      if (filterClient) params.append('clientId', filterClient)
      if (filterStatus) params.append('status', filterStatus)

      const [campaignsData, clientsData] = await Promise.all([
        fetch(`/api/campaigns?${params}`).then(r => r.json()),
        fetch('/api/clients').then(r => r.json())
      ])

      setCampaigns(campaignsData)
      setClients(clientsData)
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa campagna?')) return

    try {
      await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
      loadData()
    } catch (error) {
      console.error('Errore eliminazione campagna:', error)
    }
  }

  const handleSave = async (campaignData) => {
    try {
      if (selectedCampaign) {
        await fetch(`/api/campaigns/${selectedCampaign.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        })
      } else {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData)
        })
      }
      setShowModal(false)
      setSelectedCampaign(null)
      loadData()
    } catch (error) {
      console.error('Errore salvataggio campagna:', error)
    }
  }

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Campagne Social</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedCampaign(null)
            setShowModal(true)
          }}
        >
          ➕ Nuova Campagna
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Filtra per Cliente</label>
            <select
              className="form-select"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            >
              <option value="">Tutti i clienti</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Filtra per Stato</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tutti gli stati</option>
              {Object.entries(STATUS_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📱</div>
            <div className="empty-state-title">Nessuna campagna trovata</div>
            <p>Inizia creando la tua prima campagna social</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {campaigns.map(campaign => {
            const status = STATUS_MAP[campaign.status] || STATUS_MAP.planning
            return (
              <div key={campaign.id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{campaign.name}</h3>
                    <p className="card-subtitle">
                      👤 {campaign.client_name} • {campaign.social_platform}
                    </p>
                  </div>
                  <span className={`badge badge-${status.badge}`}>
                    {status.label}
                  </span>
                </div>

                <div className="card-body">
                  {campaign.description && (
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {campaign.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    {campaign.start_date && (
                      <div>
                        <strong>Inizio:</strong> {new Date(campaign.start_date).toLocaleDateString('it-IT')}
                      </div>
                    )}
                    {campaign.end_date && (
                      <div>
                        <strong>Fine:</strong> {new Date(campaign.end_date).toLocaleDateString('it-IT')}
                      </div>
                    )}
                    {campaign.budget && (
                      <div>
                        <strong>Budget:</strong> €{campaign.budget}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleEdit(campaign)}
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(campaign.id)}
                  >
                    🗑️ Elimina
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <CampaignModal
          campaign={selectedCampaign}
          clients={clients}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setSelectedCampaign(null)
          }}
        />
      )}
    </div>
  )
}

export default CampaignsPage
