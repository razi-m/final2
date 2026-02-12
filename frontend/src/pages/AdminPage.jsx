import React, { useState } from 'react'

function AdminPage() {
    const [users] = useState([
        { id: 1, name: 'Admin User', role: 'admin', status: 'Active', lastLogin: 'Just now' },
        { id: 2, name: 'Inspector John', role: 'inspector', status: 'Active', lastLogin: '2 hours ago' },
        { id: 3, name: 'Reviewer Sarah', role: 'reviewer', status: 'Inactive', lastLogin: '5 days ago' },
    ])

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1 className="page-title">Admin Management</h1>
                <button className="btn btn-primary">Add New User</button>
            </div>

            <div className="card">
                <h3 className="detail-section-title">User List</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Name</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Role</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Last Login</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    {user.name}
                                </td>
                                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{user.role}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`status-badge ${user.status === 'Active' ? 'status-analysis_completed' : 'status-created'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{user.lastLogin}</td>
                                <td style={{ padding: '1rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AdminPage
