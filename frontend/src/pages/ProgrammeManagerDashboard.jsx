import { useAuth } from '@clerk/clerk-react'
import { useClerk } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function ProgrammeManagerDashboard() {
  const { getToken } = useAuth()
    const { signOut } = useClerk()
  const [summary, setSummary] = useState(null)
  const [activeNav, setActiveNav] = useState('overview')

  // Fetch data from backend when page loads
  useEffect(() => {
    getToken().then(token =>
      axios.get(`${API}/programme/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSummary(res.data))
    )
  }, [])

  // Calculate attendance rate
  const total = summary
    ? (summary.present || 0) + (summary.absent || 0) + (summary.late || 0)
    : 0
  const rate = total > 0 ? Math.round((summary.present / total) * 100) : 0

  // Sidebar nav items
  const navItems = [
    { key: 'overview',  label: 'Overview',  icon: '📊' },
    { key: 'batches',   label: 'Batches',   icon: '📦' },
    { key: 'students',  label: 'Students',  icon: '🎓' },
    { key: 'reports',   label: 'Reports',   icon: '📈' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#f0faf9' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220,
        background: '#0d9488',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '0 0 24px'
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>📊 SkillBridge</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>Programme Manager</div>
        </div>

        {/* Nav Links */}
        <div style={{ marginTop: 16 }}>
          {navItems.map(item => (
            <div
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              style={{
                padding: '11px 20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: activeNav === item.key ? 600 : 400,
                background: activeNav === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeNav === item.key ? '3px solid #fff' : '3px solid transparent',
                opacity: activeNav === item.key ? 1 : 0.8,
              }}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </div>
      
      
        {/* Sign Out */}
        <div style={{ marginTop: 'auto', padding: '20px 12px 0' }}>
          <button
            onClick={() => signOut()}
            style={{
              width: '100%', padding: '10px 12px',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, textAlign: 'left'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: 32 }}>

        {/* Page Title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>
            Programme Overview
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 13 }}>
            Attendance and batch summary for all programmes.
          </p>
        </div>

        {/* Loading State */}
        {!summary && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: 48,
            textAlign: 'center', border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 32 }}>⏳</div>
            <p style={{ color: '#6b7280', marginTop: 12 }}>Loading data...</p>
          </div>
        )}

        {/* Stats Cards — shown only when data is ready */}
        {summary && (
          <>
            {/* 5 Stat Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16,
              marginBottom: 28
            }}>
              {[
                { icon: '✅', label: 'Present',        value: summary.present,        color: '#0d9488' },
                { icon: '❌', label: 'Absent',         value: summary.absent,         color: '#ef4444' },
                { icon: '⏰', label: 'Late',           value: summary.late,           color: '#f59e0b' },
                { icon: '📦', label: 'Total Batches',  value: summary.total_batches,  color: '#3b82f6' },
                { icon: '🎓', label: 'Total Students', value: summary.total_students, color: '#7c3aed' },
              ].map(card => (
                <div key={card.label} style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '20px 16px',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  borderTop: `4px solid ${card.color}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: 26 }}>{card.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: card.color, margin: '8px 0 4px' }}>
                    {card.value ?? '—'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Attendance Rate Bar */}
            <div style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              padding: '24px 28px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#374151' }}>
                  📈 Overall Attendance Rate
                </span>
                <span style={{
                  fontSize: 20, fontWeight: 800,
                  color: rate >= 75 ? '#0d9488' : rate >= 50 ? '#f59e0b' : '#ef4444'
                }}>
                  {rate}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ background: '#e5e7eb', borderRadius: 99, height: 12, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${rate}%`,
                  background: rate >= 75 ? '#0d9488' : rate >= 50 ? '#f59e0b' : '#ef4444',
                  borderRadius: 99,
                  transition: 'width 0.6s ease'
                }} />
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 13, color: '#6b7280' }}>
                <span>✅ Present: <strong>{summary.present}</strong></span>
                <span>❌ Absent: <strong>{summary.absent}</strong></span>
                <span>⏰ Late: <strong>{summary.late}</strong></span>
                <span>📋 Total: <strong>{total}</strong></span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}