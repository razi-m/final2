import React from 'react'

function DefectBadge({ defectType }) {
  return (
    <span className="defect-badge">
      ⚠ {defectType}
    </span>
  )
}

export default DefectBadge