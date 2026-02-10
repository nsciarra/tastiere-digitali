import { useState, useEffect } from 'react'

function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    campaigns: 0,
    activeCampaigns: 0,
    tasks: 0,
    upcomingTasks: 0
  })
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [clients, campaigns, tasks, upcoming] = await Promise.all([
        fetch('/api/clients').then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/tasks/upcoming').then(r => r.json())
      ])

      const activeCampaigns = campaigns.filter(c => c.status === 'active').length

      setStats({
        clients: clients.length,
        campaigns: campaigns.length,
        activeCampaigns,
        tasks: tasks.length,
        upcomingTasks: upcoming.length
      })

      setUpcomingTasks(upcoming.slice(0, 5))
    } catch (error) {
      console.error('Errore caricamento dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteTask = async (task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: 'completed' })
      })

      // Ricarica i dati
      loadDashboardData()
    } catch (error) {
      console.error('Errore completamento task:', error)
    }
  }

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Clienti Totali</div>
          <div className="stat-value">{stats.clients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Campagne Totali</div>
          <div className="stat-value">{stats.campaigns}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Campagne Attive</div>
          <div className="stat-value">{stats.activeCampaigns}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attività Totali</div>
          <div className="stat-value">{stats.tasks}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">🔔 Attività in Scadenza (Prossimi 7 giorni)</h2>
        {upcomingTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">Nessuna attività in scadenza</div>
          </div>
        ) : (
          <div className="card-body">
            {upcomingTasks.map(task => (
              <div
                key={task.id}
                style={{
                  padding: '1.25rem',
                  borderBottom: '1px solid var(--border)',
                  borderRadius: '12px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(107, 90, 207, 0.05)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--primary)' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.375rem' }}>
                      👤 {task.client_name} • 📱 {task.campaign_name}
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`badge badge-${
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' : 'success'
                    }`}>
                      {task.priority === 'high' ? '⬆️ Alta' :
                       task.priority === 'medium' ? '➡️ Media' : '⬇️ Bassa'}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-light)',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      📅 {new Date(task.due_date).toLocaleDateString('it-IT')}
                    </span>
                    <button
                      className="btn btn-success btn-small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCompleteTask(task)
                      }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      ✓ Completa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
