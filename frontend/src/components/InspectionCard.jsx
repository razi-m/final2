import React from 'react'
import StatusBadge from './StatusBadge'

function InspectionCard({ inspection, onClick }) {
  return (
    <div className="card inspection-card" onClick={onClick}>
      <div className="inspection-card-header">
        <div>
          <h3 className="inspection-card-title">{inspection.title}</h3>
          <p className="inspection-card-meta">
            Created {new Date(inspection.created_at).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={inspection.status} />
      </div>
      
      {inspection.description && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {inspection.description.substring(0, 100)}
          {inspection.description.length > 100 ? '...' : ''}
        </p>
      )}
      
      {inspection.defects?.length > 0 && (
        <div className="inspection-card-defects">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {inspection.defects.length} defects found
          </span>
        </div>
      )}
    </div>
  )
}

export default InspectionCard