import React, { useState } from 'react'

function AdminPage() {
    const [users] = useState([
        { id: 1, name: 'Admin User', role: 'admin', email: 'admin@hacksav.io', status: 'Active' },
        { id: 2, name: 'Inspector John', role: 'inspector', email: 'john@hacksav.io', status: 'Active' },
        { id: 3, name: 'Reviewer Sarah', role: 'reviewer', email: 'sarah@hacksav.io', status: 'Inactive' },
        { id: 4, name: 'Analyst Mike', role: 'analyst', email: 'mike@hacksav.io', status: 'Active' },
    ])

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1 className="page-title">Admin Management</h1>
                <div className="btn btn-secondary">Download Report</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* User List Table */}
                <div className="card">
                    <h3 className="detail-section-title">User List</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                        Manage system access and permissions.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Name</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Role</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Status</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textTransform: 'capitalize', fontSize: '0.9rem' }}>{user.role}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`status-badge ${user.status === 'Active' ? 'status-analysis_completed' : 'status-created'}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add New User Form */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h3 className="detail-section-title">Add New User</h3>
                    <form>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input type="text" className="input-glass" placeholder="jdoe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="input-glass" placeholder="John Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <select className="input-glass">
                                <option>Inspector</option>
                                <option>Reviewer</option>
                                <option>Admin</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="input-glass" placeholder="john@example.com" />
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            Add User
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default AdminPage
