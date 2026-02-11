import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { inspectionsAPI, reportsAPI } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import DefectBadge from '../components/DefectBadge'
import LoadingOverlay from '../components/LoadingOverlay'

function InspectionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [inspection, setInspection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchInspection()
  }, [id])

  const fetchInspection = async () => {
    try {
      const response = await inspectionsAPI.getById(id)
      setInspection(response.data)
    } catch (err) {
      setError('Failed to load inspection')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setActionLoading(true)
    setError('')
    
    try {
      await inspectionsAPI.uploadVideo(id, selectedFile)
      await fetchInspection()
      setSelectedFile(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload video')
    } finally {
      setActionLoading(false)
    }
  }

  const handleAnalyze = async () => {
    setActionLoading(true)
    setError('')
    
    try {
      await inspectionsAPI.analyze(id)
      await fetchInspection()
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    setError('')
    
    try {
      await inspectionsAPI.approve(id)
      await fetchInspection()
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    try {
      const response = await reportsAPI.download(id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `inspection_report_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download report')
    }
  }

  if (loading) return <LoadingOverlay />
  if (!inspection) return <div>Inspection not found</div>

  return (
    <div>
      {actionLoading && <LoadingOverlay />}

      <div className="page-header">
        <div>
          <h1 className="page-title">{inspection.title}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {inspection.description || 'No description'}
          </p>
        </div>
        <StatusBadge status={inspection.status} />
      </div>

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

      <div className="detail-grid">
        <div>
          {/* Video Upload Section */}
          {inspection.status === 'created' && (
            <div className="card detail-section">
              <h3 className="detail-section-title">Upload Video</h3>
              <div className="video-upload-zone">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  id="video-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="video-input" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
                  <p>{selectedFile ? selectedFile.name : 'Click to select video file'}</p>
                </label>
              </div>
              {selectedFile && (
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  onClick={handleUpload}
                >
                  Upload Video
                </button>
              )}
            </div>
          )}

          {/* Analysis Section */}
          {inspection.status === 'video_uploaded' && (
            <div className="card detail-section">
              <h3 className="detail-section-title">Run Analysis</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Video uploaded successfully. Start AI analysis to detect defects.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={handleAnalyze}
              >
                Start Analysis
              </button>
            </div>
          )}

          {inspection.status === 'analyzing' && (
            <div className="card detail-section">
              <h3 className="detail-section-title">Analysis in Progress</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
                <span>Analyzing video frames...</span>
              </div>
            </div>
          )}

          {/* Approval Section */}
          {inspection.status === 'analysis_completed' && (
            <div className="card detail-section">
              <h3 className="detail-section-title">Review & Approve</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Analysis complete. Review defects and approve to generate report.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={handleApprove}
              >
                Approve & Generate Report
              </button>
            </div>
          )}

          {inspection.status === 'approved' && inspection.report && (
            <div className="card detail-section">
              <h3 className="detail-section-title">Report Generated</h3>
              <button 
                className="btn btn-primary" 
                onClick={handleDownloadReport}
              >
                Download PDF Report
              </button>
            </div>
          )}
        </div>

        <div>
          {/* Defects Section */}
          <div className="card detail-section">
            <h3 className="detail-section-title">
              Detected Defects ({inspection.defects?.length || 0})
            </h3>
            
            {inspection.defects?.length === 0 && (
              <p style={{ color: 'var(--text-muted)' }}>
                {inspection.status === 'analysis_completed' || inspection.status === 'approved' 
                  ? 'No defects detected in this inspection.' 
                  : 'Defects will appear here after analysis.'}
              </p>
            )}

            <div className="defect-list">
              {inspection.defects?.map((defect, index) => (
                <div key={index} className="defect-item">
                  <div>
                    <DefectBadge defectType={defect.defect_type} />
                    <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)' }}>
                      Frame {defect.frame_number}
                    </span>
                  </div>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {(defect.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="card detail-section">
            <h3 className="detail-section-title">Details</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created</span>
                <span>{new Date(inspection.created_at).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Updated</span>
                <span>{inspection.updated_at ? new Date(inspection.updated_at).toLocaleString() : 'N/A'}</span>
              </div>
              {inspection.video_path && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Video</span>
                  <span style={{ color: 'var(--success)' }}>✓ Uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginTop: '2rem' }}
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}

export default InspectionDetailPage