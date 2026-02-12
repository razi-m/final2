import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreateInspectionPage from './pages/CreateInspectionPage'
import InspectionDetailPage from './pages/InspectionDetailPage'
import AdminPage from './pages/AdminPage'
import DefectsPage from './pages/DefectsPage'
import LoadingOverlay from './components/LoadingOverlay'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingOverlay message="Authenticating..." />

  // For demo purposes, we might allow access to Home/Login without auth, 
  // but protect dashboard/admin. 
  // However, the redesign has "Authority Login" on Home.
  // We'll protect specific routes.
  if (!user) return <Navigate to="/login" />

  return children
}

function App() {
  const { loading } = useAuth()

  if (loading) return <LoadingOverlay message="Loading application..." />

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <PrivateRoute><AdminPage /></PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/inspections" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />
          <Route path="/inspections/:id" element={
            <PrivateRoute><InspectionDetailPage /></PrivateRoute>
          } />
          <Route path="/create-inspection" element={
            <PrivateRoute><CreateInspectionPage /></PrivateRoute>
          } />
          <Route path="/defects" element={
            <PrivateRoute><DefectsPage /></PrivateRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App