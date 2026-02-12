import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inspectionsAPI } from '../api/client'
import LoadingOverlay from '../components/LoadingOverlay'

function CreateInspectionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [supervisor, setSupervisor] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const backendDescription = `Destination: ${description}. Supervisor: ${supervisor}`
      const response = await inspectionsAPI.create({ title, description: backendDescription })
      navigate(`/inspections/${response.data.id}`)
    } catch (err) {
      setError('Failed to create inspection')
      setLoading(false)
    }
  }

  return (
    <div className="processing-queue-page">
      <div className="page-header">
        <h1 className="page-title">Processing Queue</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '2rem' }}>
        {/* Left: Drag & Drop Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: '2px', padding: '3rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--accent-secondary)'
          }}>
            ☁️
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop Video Upload</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Accepted file types: MP4 / MOV</p>

          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} onClick={() => document.getElementById('submit-btn').click()}>
            Start AI Analysis
          </button>
        </div>

        {/* Right: Mission Form (Mideo Dasview Paned) */}
        <div className="card">
          <h3 className="detail-section-title">Mission Dashboard Panel</h3>

          {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Mission Name</label>
              <input
                type="text"
                className="input-glass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Location"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Destination</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-glass"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Austin / Sector 4"
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.5 }}>📍</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Department / Supervisor</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-glass"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Engineering / Resp. Officer"
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.5 }}>🏢</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Date/Time</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="input-glass"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <span style={{ position: 'absolute', right: '10px', top: '10px', opacity: 0.5 }}>📅</span>
              </div>
            </div>

            <button id="submit-btn" type="submit" style={{ display: 'none' }}></button>
          </form>
        </div>
      </div>

      {loading && <LoadingOverlay message="Initializing Mission..." />}
    </div>
  )
}

export default CreateInspectionPage