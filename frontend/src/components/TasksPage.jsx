import { useState, useEffect } from 'react'
import TaskModal from './TaskModal'

const STATUS_MAP = {
  todo: { label: 'Da Fare', badge: 'secondary' },
  in_progress: { label: 'In Corso', badge: 'warning' },
  completed: { label: 'Completata', badge: 'success' }
}

const PRIORITY_MAP = {
  low: { label: 'Bassa', badge: 'success', icon: '⬇️' },
  medium: { label: 'Media', badge: 'warning', icon: '➡️' },
  high: { label: 'Alta', badge: 'danger', icon: '⬆️' }
}

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filterStatus, filterPriority])

  const loadData = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.append('status', filterStatus)
      if (filterPriority) params.append('priority', filterPriority)

      const [tasksData, campaignsData] = await Promise.all([
        fetch(`/api/tasks?${params}`).then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json())
      ])

      setTasks(tasksData)
      setCampaigns(campaignsData)
    } catch (error) {
      console.error('Errore caricamento dati:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Sei sicuro di voler eliminare questa attività?')) return

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      loadData()
    } catch (error) {
      console.error('Errore eliminazione attività:', error)
    }
  }

  const handleStatusChange = async (task, newStatus) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      })
      loadData()
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
    }
  }

  const handleSave = async (taskData) => {
    try {
      if (selectedTask) {
        await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })
      }
      setShowModal(false)
      setSelectedTask(null)
      loadData()
    } catch (error) {
      console.error('Errore salvataggio attività:', error)
    }
  }

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="loading">Caricamento...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Attività</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedTask(null)
            setShowModal(true)
          }}
        >
          ➕ Nuova Attività
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
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

          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Filtra per Priorità</label>
            <select
              className="form-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">Tutte le priorità</option>
              {Object.entries(PRIORITY_MAP).map(([key, value]) => (
                <option key={key} value={key}>{value.icon} {value.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">Nessuna attività trovata</div>
            <p>Inizia creando la tua prima attività</p>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {tasks.map(task => {
            const status = STATUS_MAP[task.status] || STATUS_MAP.todo
            const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium
            const overdue = isOverdue(task.due_date, task.status)

            return (
              <div key={task.id} className="card">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{task.title}</h3>
                    <p className="card-subtitle">
                      👤 {task.client_name} • {task.campaign_name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span className={`badge badge-${status.badge}`}>
                      {status.label}
                    </span>
                    <span className={`badge badge-${priority.badge}`}>
                      {priority.icon} {priority.label}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  {task.description && (
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    {task.due_date && (
                      <div style={{ color: overdue ? 'var(--danger)' : 'inherit' }}>
                        <strong>Scadenza:</strong> {new Date(task.due_date).toLocaleDateString('it-IT')}
                        {overdue && ' ⚠️ Scaduta'}
                      </div>
                    )}
                    {task.assigned_to && (
                      <div>
                        <strong>Assegnata a:</strong> {task.assigned_to}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer">
                  {task.status !== 'completed' && (
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleStatusChange(task, 'completed')}
                    >
                      ✓ Completa
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleEdit(task)}
                  >
                    ✏️ Modifica
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(task.id)}
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
        <TaskModal
          task={selectedTask}
          campaigns={campaigns}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setSelectedTask(null)
          }}
        />
      )}
    </div>
  )
}

export default TasksPage
