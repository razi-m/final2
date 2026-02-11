import React from 'react'

function StatusBadge({ status }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'created':
        return 'status-created'
      case 'video_uploaded':
        return 'status-video_uploaded'
      case 'analyzing':
        return 'status-analyzing'
      case 'analysis_completed':
        return 'status-analysis_completed'
      case 'approved':
        return 'status-approved'
      case 'failed':
        return 'status-failed'
      default:
        return 'status-created'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return '○'
      case 'video_uploaded':
        return '📹'
      case 'analyzing':
        return '🔍'
      case 'analysis_completed':
        return '✓'
      case 'approved':
        return '✓'
      case 'failed':
        return '✗'
      default:
        return '○'
    }
  }

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      <span>{getStatusIcon(status)}</span>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default StatusBadge