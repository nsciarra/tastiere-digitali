import { useState, useEffect } from 'react'
import ClientModal from './ClientModal'
import SocialModal from './SocialModal'

function ClientsPage() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [clientSocials, setClientSocials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Errore caricamento clienti:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (client) => {
    setSelectedClient(client)
    setShowModal(true)
  }

  const handleManageSocials = async (client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/socials`)
      const socials = await response.json()
      setClientSocials(socials)
      setSelectedClient(client)
      setShowSocialModal(true)
    } catch (error) {
      console.error('Errore caricamento social:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return

    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      loadClients()
    } catch (error) {
      console.error('Errore eliminazione cliente:', error)
    }
  }

  const handleSave = async (clientData) => {
    try {
      if (selectedClient) {
        await fetch(`/api/clients/${selectedClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData)
        })
      } else {
        await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clientData)
        })
      }
      setShowModal(false)
      setSelectedClient(null)
      loadClients()
    } catch (error) {
      console.error('Errore salvataggio cliente:', error)
    }
  }

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clienti</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedClient(null)
            setShowModal(true)
          }}
        >
          ➕ Nuovo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">Nessun cliente trovato</div>
            <p>Inizia aggiungendo il tuo primo cliente</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {clients.map(client => (
            <div key={client.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{client.name}</h3>
                  {client.email && (
                    <p className="card-subtitle">📧 {client.email}</p>
                  )}
                  {client.phone && (
                    <p className="card-subtitle">📱 {client.phone}</p>
                  )}
                  {client.website && (
                    <p className="card-subtitle">🌐 {client.website}</p>
                  )}
                </div>
              </div>

              {client.notes && (
                <div className="card-body">
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                    {client.notes}
                  </p>
                </div>
              )}

              <div className="card-footer">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleManageSocials(client)}
                >
                  📱 Social
                </button>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => handleEdit(client)}
                >
                  ✏️ Modifica
                </button>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(client.id)}
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          client={selectedClient}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setSelectedClient(null)
          }}
        />
      )}

      {showSocialModal && (
        <SocialModal
          client={selectedClient}
          socials={clientSocials}
          onClose={() => {
            setShowSocialModal(false)
            setSelectedClient(null)
            setClientSocials([])
          }}
          onUpdate={loadClients}
        />
      )}
    </div>
  )
}

export default ClientsPage
