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
  const [activeDefect, setActiveDefect] = useState(null) // To show in "Defect Detail" panel

  useEffect(() => {
    fetchInspection()
  }, [id])

  // Select first defect when inspection loads
  useEffect(() => {
    if (inspection?.defects?.length > 0 && !activeDefect) {
      setActiveDefect(inspection.defects[0])
    }
  }, [inspection])

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
      setError('Failed to upload video')
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
      setError('Analysis failed')
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
      setError('Approval failed')
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
    } catch (err) {
      setError('Failed to download report')
    }
  }

  if (loading) return <LoadingOverlay />
  if (!inspection) return <div>Inspection not found</div>

  return (
    <div className="review-panel-page">
      {actionLoading && <LoadingOverlay message="Processing..." />}

      <div className="page-header">
        <h1 className="page-title">Video + Frame Review Panel</h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="status-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Mission: {inspection.title}
          </div>
          <StatusBadge status={inspection.status} />
          {inspection.status === 'approved' && (
            <button className="btn btn-primary" onClick={handleDownloadReport}>Download PDF Report</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

        {/* LEFT: Video Player / Main Visual */}
        <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

          {/* State: Upload Needed */}
          {inspection.status === 'created' && (
            <div className="video-upload-zone" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '4rem' }}>
              <h3>Upload Mission Footage</h3>
              <input type="file" onChange={handleFileSelect} style={{ marginTop: '1rem' }} accept="video/*" />
              <div style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={handleUpload} disabled={!selectedFile}>
                  Upload Video
                </button>
              </div>
            </div>
          )}

          {/* State: Ready for Analysis */}
          {inspection.status === 'video_uploaded' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem' }}>🎬</div>
              <h3>Footage Loaded</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Ready for AI Analysis</p>
              <button className="btn btn-primary" onClick={handleAnalyze} style={{ marginTop: '1rem' }}>
                Start AI Analysis
              </button>
            </div>
          )}

          {/* State: Analyzing */}
          {inspection.status === 'analyzing' && (
            <div style={{ textAlign: 'center' }}>
              <div className="spinner"></div>
              <h3>Processing video with AI...</h3>
              <p>Please wait.</p>
            </div>
          )}

          {/* State: Completed / Approved */}
          {(inspection.status === 'analysis_completed' || inspection.status === 'approved') && (
            <div style={{ position: 'relative', height: '100%', background: 'black', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Mock Video Player visuals */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'rgba(255,255,255,0.2)', fontSize: '5rem' }}>▶</div>
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                  <div style={{ width: '60%', height: '100%', background: 'var(--accent-primary)' }}></div>
                </div>
              </div>
              {/* Detected Boxes Overlay (Simulated) */}
              {activeDefect && (
                <div style={{
                  position: 'absolute',
                  top: '30%', left: '40%',
                  width: '100px', height: '100px',
                  border: '2px solid red',
                  boxShadow: '0 0 10px red'
                }}>
                  <div style={{ background: 'red', color: 'white', fontSize: '10px', padding: '2px', position: 'absolute', top: '-15px' }}>
                    {activeDefect.defect_type} {(activeDefect.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Defect Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Defect Detail Box */}
          <div className="card">
            <h3 className="detail-section-title">Defect Detail</h3>

            {activeDefect ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Type</label>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{activeDefect.defect_type}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Severity</label>
                  <div style={{ color: activeDefect.confidence > 0.8 ? 'var(--error)' : 'var(--warning)' }}>
                    {activeDefect.confidence > 0.8 ? 'High' : 'Medium'}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Confidence</label>
                  <div>{(activeDefect.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Suggested Action</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                    Fast Patch Repair
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No defect selected or none detected.
              </div>
            )}

            {inspection.status === 'analysis_completed' && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleApprove}>
                Generate PDF Report
              </button>
            )}
          </div>

          {/* List of other defects */}
          <div className="card" style={{ flex: 1 }}>
            <h3 className="detail-section-title">Detection History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {inspection.defects?.map((defect, i) => (
                <div
                  key={i}
                  onClick={() => setActiveDefect(defect)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: activeDefect === defect ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{defect.defect_type}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Frame {defect.frame_number}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default InspectionDetailPage