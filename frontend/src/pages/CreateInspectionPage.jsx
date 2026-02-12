import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inspectionsAPI } from '../api/client'
import LoadingOverlay from '../components/LoadingOverlay'

function CreateInspectionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Add dummy fields for visual match
  const [supervisor, setSupervisor] = useState('Austin / Inspector')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Map visual fields to backend fields
      // Title -> Mission Name
      // Description -> Destination + Supervisor
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left: Drag & Drop Area */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <h3 className="detail-section-title">Upload Media</h3>
          <div className="video-upload-zone" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.7 }}>☁️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Drag & Drop Video Upload</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Accepted file types: MP4 / MOV</p>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => document.getElementById('submit-btn').click()}>
            Start AI Analysis
          </button>
        </div>

        {/* Right: Mideo Dasview Paned (Form) */}
        <div className="card">
          <h3 className="detail-section-title">Mission Dashboard Panel</h3>

          {error && <div style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Mission Name</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Bridge Inspection 001"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex. Austin / Sector 4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Supervisor / Department</label>
              <input
                type="text"
                className="form-input"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date/Time</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Hidden submit button triggered by the main button */}
            <button id="submit-btn" type="submit" style={{ display: 'none' }}></button>
          </form>
        </div>
      </div>

      {loading && <LoadingOverlay message="Initializing Mission..." />}
    </div>
  )
}

export default CreateInspectionPage