import { SignUp, useUser, useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import StudentDashboard from './pages/StudentDashboard'
import TrainerDashboard from './pages/TrainerDashboard'
import InstitutionDashboard from './pages/InstitutionDashboard'
import ProgrammeManagerDashboard from './pages/ProgrammeManagerDashboard'
import MonitoringDashboard from './pages/MonitoringDashboard'

const API = import.meta.env.VITE_API_URL

export default function App() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [dbUser, setDbUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Register user with selected role ──
  const registerUser = async () => {
    if (!selectedRole) return
    setLoading(true)
    try {
      const token = await getToken()
      const res = await axios.post(`${API}/users/register`, {
        clerk_user_id: user.id,
        name: user.fullName || user.emailAddresses[0].emailAddress,
        role: selectedRole,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setDbUser(res.data)
    } catch (err) {
      alert('Registration failed: ' + err.message)
    }
    setLoading(false)
  }

  // ── Fetch existing user on login ──
  useEffect(() => {
    if (isSignedIn && user) {
      getToken().then(async (token) => {
        try {
          const res = await axios.get(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          setDbUser(res.data)
        } catch { }
      })
    }
  }, [isSignedIn, user])

  // ── 1. App is still loading ──
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', fontFamily: 'Segoe UI, sans-serif',
        background: '#f0fdf4'
      }}>
        <div style={{
          width: 44, height: 44,
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #0d9488',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
          Loading SkillBridge...
        </p>
      </div>
    )
  }

  // ── 2. User not signed in — show Clerk SignUp ──
  if (!isSignedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <SignUp />
      </div>
    )
  }

  // ── 3. Signed in but no role yet — show Role Selection ──
  if (!dbUser) {
    const roles = [
      { value: 'student',            icon: '🎓', label: 'Student',            desc: 'View sessions & attendance' },
      { value: 'trainer',            icon: '👨‍🏫', label: 'Trainer',            desc: 'Create sessions & manage batches' },
      { value: 'institution',        icon: '🏫', label: 'Institution',         desc: 'Oversee all programmes' },
      { value: 'programme_manager',  icon: '📊', label: 'Programme Manager',   desc: 'Track programme-wide data' },
      { value: 'monitoring_officer', icon: '👁️', label: 'Monitoring Officer',  desc: 'Read-only access to data' },
    ]

    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif', padding: 20
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>🎓</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>
              Welcome to SkillBridge
            </h1>
            <p style={{ color: '#6b7280', marginTop: 8, fontSize: 15 }}>
              Hi <strong>{user?.firstName || user?.emailAddresses[0]?.emailAddress}</strong>!
              &nbsp;Select your role to continue.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16
          }}>
            {roles.map(role => (
              <div
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                style={{
                  background: selectedRole === role.value ? '#0d9488' : '#fff',
                  color: selectedRole === role.value ? '#fff' : '#111827',
                  border: selectedRole === role.value
                    ? '2px solid #0d9488'
                    : '2px solid #e5e7eb',
                  borderRadius: 14,
                  padding: '18px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRole === role.value
                    ? '0 4px 16px rgba(13,148,136,0.25)'
                    : '0 1px 4px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 8 }}>{role.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                  {role.label}
                </div>
                <div style={{
                  fontSize: 11,
                  color: selectedRole === role.value ? 'rgba(255,255,255,0.8)' : '#6b7280',
                  lineHeight: 1.4
                }}>
                  {role.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={registerUser}
            disabled={!selectedRole || loading}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: !selectedRole || loading ? '#d1d5db' : '#0d9488',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: !selectedRole || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              boxShadow: !selectedRole || loading
                ? 'none'
                : '0 4px 14px rgba(13,148,136,0.3)'
            }}
          >
            {loading
              ? '⏳ Setting up your account...'
              : selectedRole
                ? `Continue as ${selectedRole.replace('_', ' ')} →`
                : 'Select a role to continue'
            }
          </button>

          {/* Warning note */}
          <p style={{
            textAlign: 'center', fontSize: 12,
            color: '#9ca3af', marginTop: 14
          }}>
            ⚠️ You can only select a role once. Choose carefully!
          </p>

        </div>
      </div>
    )
  }

  // ── 4. Show the correct dashboard based on role ──
  const dashboards = {
    student:            <StudentDashboard />,
    trainer:            <TrainerDashboard />,
    institution:        <InstitutionDashboard />,
    programme_manager:  <ProgrammeManagerDashboard />,
    monitoring_officer: <MonitoringDashboard />,
  }

  return dashboards[dbUser?.role] || (
    <div style={{ textAlign: 'center', marginTop: 100, fontFamily: 'Segoe UI' }}>
      <p>⚠️ Unknown role: <strong>{dbUser?.role}</strong></p>
    </div>
  )
}