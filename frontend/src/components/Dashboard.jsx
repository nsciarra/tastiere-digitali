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
              <div key={task.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{task.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                      {task.client_name} - {task.campaign_name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge badge-${
                      task.priority === 'high' ? 'danger' :
                      task.priority === 'medium' ? 'warning' : 'success'
                    }`}>
                      {task.priority}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      {new Date(task.due_date).toLocaleDateString('it-IT')}
                    </span>
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
