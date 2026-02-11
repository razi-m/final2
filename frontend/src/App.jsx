import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreateInspectionPage from './pages/CreateInspectionPage'
import InspectionDetailPage from './pages/InspectionDetailPage'
import Navbar from './components/Navbar'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  const { token } = useAuth()

  return (
    <div className="app">
      {token && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/inspections/new" 
            element={
              <PrivateRoute>
                <CreateInspectionPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/inspections/:id" 
            element={
              <PrivateRoute>
                <InspectionDetailPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  )
}

export default App