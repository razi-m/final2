import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { inspectionsAPI } from '../api/client'
import LoadingOverlay from '../components/LoadingOverlay'

function CreateInspectionPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await inspectionsAPI.create({ title, description })
      navigate(`/inspections/${response.data.id}`)
    } catch (err) {
      setError('Failed to create inspection')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create New Inspection</h1>
      </div>

      {loading && <LoadingOverlay message="Creating inspection..." />}

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.2)', 
            color: '#FCA5A5', 
            padding: '0.75rem', 
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter inspection title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter inspection description"
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              Create Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateInspectionPage