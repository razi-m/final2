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
            navigate('/dashboard')
        } catch (err) {
            setError('Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    // HD City Night Placeholder
    const bgImage = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop"

    return (
        <div className="hero-page" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <img src={bgImage} alt="Drone City" className="hero-bg" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) contrast(1.2)' }} />

            {/* Cinematic Overlay */}
            <div className="hero-overlay" style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(90deg, #020617 0%, rgba(2, 6, 23, 0.9) 45%, rgba(2, 6, 23, 0.3) 100%)'
            }}></div>

            <div className="hero-content" style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: '1600px', margin: '0 auto',
                height: '100%', display: 'flex', alignItems: 'center', padding: '0 4rem'
            }}>

                {/* LEFT: Hero Text */}
                <div style={{ flex: 1, paddingRight: '4rem' }} className="animate-fade-in delay-1">
                    <h1 className="hero-title" style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1rem', color: 'white' }}>
                        AI-Powered<br />
                        Infrastructure Inspection
                    </h1>

                    <p className="hero-subtitle delay-2 animate-fade-in" style={{
                        fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '3rem'
                    }}>
                        Autonomous drone surveillance with real-time defect detection.
                        Secure, scalable, and built for modern smart cities.
                    </p>

                    <div style={{ marginBottom: '1rem', color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>How It Works</div>

                    <div className="grid-steps delay-3 animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
                        <StepIcon icon="✈️" />
                        <div className="step-arrow" style={{ color: 'var(--accent-primary)' }}>→</div>
                        <StepIcon icon="🧠" />
                        <div className="step-arrow" style={{ color: 'var(--accent-primary)' }}>→</div>
                        <StepIcon icon="☁️" />
                        <div className="step-arrow" style={{ color: 'var(--accent-primary)' }}>→</div>
                        <StepIcon icon="📊" />

                        {/* Request Authority Access Button */}
                        <button className="btn" style={{
                            marginLeft: '2rem',
                            background: 'linear-gradient(90deg, #3B82F6 0%, #00E5FF 100%)',
                            color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '8px',
                            boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            Request Authority Access 🔒
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }} className="delay-4 animate-fade-in">
                        <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60A5FA', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Drone AI Won</div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Secure Backend</div>
                        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>Audit Logs</div>
                    </div>
                </div>

                {/* RIGHT: Login Panel + Stats */}
                <div style={{ display: 'flex', gap: '2rem', position: 'relative' }} className="animate-fade-in delay-2">

                    {/* Login Card */}
                    <div className="glass-panel" style={{
                        width: '380px', padding: '2.5rem',
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(15, 23, 42, 0.6)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '70px', height: '70px', margin: '0 auto 1rem',
                                background: 'url("https://cdn-icons-png.flaticon.com/512/9638/9638337.png")', // Shield Icon Placeholder
                                backgroundSize: 'contain', backgroundRepeat: 'no-repeat', filter: 'brightness(0) invert(1)'
                            }}></div> {/* Fallback Shield */}
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛡️</div> { /* Use emoji as fallback for icon */}
                            <h2 style={{ color: 'white', fontSize: '1.5rem' }}>Authority Login</h2>
                        </div>

                        {error && <div style={{ color: '#FCA5A5', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Username Name</label>
                                <input type="text" className="input-glass" value={username} onChange={(e) => setUsername(e.target.value)} style={{ background: 'white', color: 'black' }} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                                <input type="password" className="input-glass" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: 'white', color: 'black' }} />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Role</label>
                                <select className="input-glass" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                    <option>Admin / Inspector</option>
                                </select>
                            </div>
                            <button type="submit" className="btn" style={{
                                width: '100%', background: '#3B82F6', color: 'white', padding: '0.8rem', borderRadius: '6px', fontWeight: '600'
                            }}>Login</button>
                        </form>
                    </div>

                    {/* Stats Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '2rem' }}>
                        <StatCard label="Total Defects" value="124" />
                        <StatCard label="Critical Issues" value="15" highlight />
                        <StatCard label="Avg Confidence" value="92.5%" />
                        <StatCard label="Reports Generated" value="84" />

                        <div style={{
                            marginTop: 'auto', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wireless telemetry Dashboard</span>
                            <div style={{ background: 'white', color: 'black', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>↗</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function StepIcon({ icon }) {
    return (
        <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            border: '2px solid var(--accent-primary)', color: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
            background: 'rgba(0, 229, 255, 0.1)'
        }}>
            {icon}
        </div>
    )
}

function StatCard({ label, value, highlight }) {
    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '1rem 1.5rem', borderRadius: '12px', backdropFilter: 'blur(8px)',
            minWidth: '160px'
        }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: highlight ? 'var(--error)' : 'white' }}>{value}</div>
        </div>
    )
}

export default HomePage
