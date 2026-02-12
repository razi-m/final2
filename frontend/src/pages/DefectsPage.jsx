import React, { useState, useEffect } from 'react'
import api from '../api/client'

function DefectsPage() {
    const [defects, setDefects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDefects = async () => {
            try {
                const response = await api.get('/inspections')
                // Flatten inspections to get all defects
                const allDefects = response.data.flatMap(inspection =>
                    inspection.defects.map(d => ({
                        ...d,
                        inspectionTitle: inspection.title,
                        inspectionId: inspection.id,
                        date: inspection.created_at
                    }))
                )
                setDefects(allDefects)
            } catch (error) {
                console.error("Failed to fetch defects", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDefects()
    }, [])

    if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>

    return (
        <div className="defects-page">
            <div className="page-header">
                <h1 className="page-title">Defect Table</h1>
                <div className="btn btn-secondary">Export CSV</div>
            </div>

            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Defect Appears In</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Type</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Confidence</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Frame #</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Date Detected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defects.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No defects found.</td></tr>
                        ) : (
                            defects.map((defect, index) => (
                                <tr key={`${defect.id}-${index}`} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{defect.inspectionTitle}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className="defect-badge">{defect.defect_type}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '100px',
                                                height: '6px',
                                                background: 'rgba(255,255,255,0.1)',
                                                borderRadius: '3px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: `${defect.confidence * 100}%`,
                                                    height: '100%',
                                                    background: defect.confidence > 0.8 ? 'var(--success)' : 'var(--warning)'
                                                }}></div>
                                            </div>
                                            {(defect.confidence * 100).toFixed(1)}%
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{defect.frame_number}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        {new Date(defect.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DefectsPage
