import React from 'react'
import LoginButton from './components/LoginButton'
import ProfilePage from './pages/ProfilePage'
import WizardForm from './components/WizardForm'
import UploadPage from './pages/UploadPage'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import AdminPage from './pages/AdminPage'
import ViewPage from './pages/ViewPage'
import ExplorePage from './pages/ExplorePage'
import HomePage from './pages/HomePage'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
  return (
    <AuthProvider>
    <div className='flex '>
      {!hideNavbar && <Navbar />}
      <div className='flex-1  overflow-hidden'>
          <Routes>

            {/* PUBLIC */}

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginButton />
                </PublicRoute>
              }
            />


            {/* ONBOARDING */}

            <Route
              path="/create-profile"
              element={
                <ProtectedRoute requireProfile={false} >
                  <WizardForm />
                </ProtectedRoute>
              }
            />


            {/* PROTECTED */}

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <ExplorePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/view"
              element={
                <ProtectedRoute>
                  <ViewPage />
                </ProtectedRoute>
              }
            />


            {/* ADMIN */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

          </Routes>
       
      </div>
    </div>
    </AuthProvider>
  )
}

export default App