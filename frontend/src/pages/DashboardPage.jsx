import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { inspectionsAPI } from '../api/client'
import InspectionCard from '../components/InspectionCard'
import LoadingOverlay from '../components/LoadingOverlay'

function DashboardPage() {
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchInspections()
  }, [])

  const fetchInspections = async () => {
    try {
      const response = await inspectionsAPI.getAll()
      setInspections(response.data)
    } catch (err) {
      setError('Failed to load inspections')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Inspections</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/inspections/new')}
        >
          + New Inspection
        </button>
      </div>

      {loading && <LoadingOverlay />}

      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.2)', 
          color: '#FCA5A5', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {!loading && inspections.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No inspections yet</h3>
          <p>Create your first inspection to get started</p>
        </div>
      )}

      <div className="card-grid">
        {inspections.map((inspection) => (
          <InspectionCard 
            key={inspection.id} 
            inspection={inspection}
            onClick={() => navigate(`/inspections/${inspection.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default DashboardPage