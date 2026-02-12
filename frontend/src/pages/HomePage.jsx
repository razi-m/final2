import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function HomePage() {
    const { login, user } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('admin')
    const [password, setPassword] = useState('admin123')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await login(username, password)
            navigate('/inspections')
        } catch (err) {
            setError('Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    // Placeholder Drone City Image
    const bgImage = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop"

    return (
        <div className="hero-wrapper">
            <img src={bgImage} alt="Drone City" className="hero-bg" />
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', width: '150vh' }}>
                    {/* Left: Text */}
                    <div style={{ flex: 1 }}>
                        <h1 className="hero-title">
                            AI-Powered<br />
                            Infrastructure Inspection
                        </h1>
                        <p className="hero-subtitle">
                            Autonomous drone surveillance with real-time defect detection.
                            Secure, efficient, and AI-driven analysis for modern cities.
                        </p>

                        <div className="grid-steps">
                            <div className="step-item">✈️</div>
                            <div className="step-item">🤖</div>
                            <div className="step-item">🔍</div>
                            <div className="step-item">📊</div>
                        </div>

                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                            <div className="status-badge status-approved">Drone AI Won</div>
                            <div className="status-badge status-created">Secure Backend</div>
                            <div className="status-badge status-analyzing">Audit Logs</div>
                        </div>
                    </div>

                    {/* Right: Login & Stats */}
                    <div style={{ width: '400px' }}>
                        {!user ? (
                            <div className="card login-grid" style={{ backdropFilter: 'blur(20px)', border: '1px solid var(--accent-primary)' }}>
                                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                                    <h2 style={{ color: 'white' }}>Authority Login</h2>
                                </div>

                                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                                <form onSubmit={handleLogin}>
                                    <div className="form-group">
                                        <label className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                        {loading ? 'Authenticating...' : 'Login'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="card">
                                <h3>Welcome, {user.username}</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                                    <StatBox label="Total Defects" value="124" />
                                    <StatBox label="Avg Confidence" value="92.5%" />
                                    <StatBox label="Reports" value="15" />
                                    <StatBox label="Critical" value="3" />
                                </div>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => navigate('/create-inspection')}>
                                    Start Inspection
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatBox({ label, value }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
        </div>
    )
}

export default HomePage
