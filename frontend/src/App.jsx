import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ClientsPage from './components/ClientsPage'
import CampaignsPage from './components/CampaignsPage'
import TasksPage from './components/TasksPage'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'clients':
        return <ClientsPage />
      case 'campaigns':
        return <CampaignsPage />
      case 'tasks':
        return <TasksPage />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">🎹 Tastiere Digitali</div>
            <nav className="nav">
              <button
                className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`nav-btn ${currentPage === 'clients' ? 'active' : ''}`}
                onClick={() => setCurrentPage('clients')}
              >
                👥 Clienti
              </button>
              <button
                className={`nav-btn ${currentPage === 'campaigns' ? 'active' : ''}`}
                onClick={() => setCurrentPage('campaigns')}
              >
                📱 Campagne
              </button>
              <button
                className={`nav-btn ${currentPage === 'tasks' ? 'active' : ''}`}
                onClick={() => setCurrentPage('tasks')}
              >
                ✅ Attività
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}

export default App
