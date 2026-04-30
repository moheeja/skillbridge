import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useClerk } from '@clerk/clerk-react'

const API = import.meta.env.VITE_API_URL

export default function InstitutionDashboard() {
  const { getToken } = useAuth() 
  const { signOut } = useClerk()
  
  const [stats, setStats] = useState({ total_batches: '...', total_trainers: '...', total_students: '...' })
  const [batches, setBatches] = useState([])
  const [batchSummaries, setBatchSummaries] = useState({})
  const [activeMenu, setActiveMenu] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    try {
        const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      const [statsRes, batchRes] = await Promise.all([
        fetch(`${API}/institution/stats`, { headers }),  // ✅ fixed
        fetch(`${API}/batches`, { headers }) 
      ])

      const statsData = await statsRes.json()
      const batchData = await batchRes.json()
      setStats(statsData)
      setBatches(batchData)

      const summaries = {}
      for (const batch of batchData) {
        // ✅ Change to:
const res = await fetch(`${API}/batches/${batch.id}/summary`, { headers })
        const data = await res.json()
        summaries[batch.id] = data
      }
      setBatchSummaries(summaries)

    } catch (err) {
      console.error('Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'batches',  icon: '📦', label: 'Batches' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#f0f2f5' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 240,
        background: '#1a237e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>🏫 SkillBridge</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>Institution Panel</div>
        </div>

        {/* Menu */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: 4,
                background: activeMenu === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontWeight: activeMenu === item.id ? 600 : 400,
                fontSize: 14,
                transition: 'background 0.2s'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom */}
       
<div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
  <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 10 }}>Institution Admin</div>
  <button
    onClick={() => signOut()}
    style={{
      width: '100%',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: 13,
      textAlign: 'left'
    }}
  >
    🚪 Sign Out
  </button>
</div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: 240, flex: 1, padding: '32px 28px' }}>

        {/* ── OVERVIEW ── */}
        {activeMenu === 'overview' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#1a237e' }}>Overview</h2>
            <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>Institution summary at a glance</p>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '📦', label: 'Total Batches',  value: loading ? '...' : stats.total_batches, color: '#e3f2fd', accent: '#1565c0' },
                { icon: '👨‍🏫', label: 'Total Trainers', value: loading ? '...' : stats.total_trainers, color: '#f3e5f5', accent: '#6a1b9a' },
                { icon: '🎓', label: 'Total Students', value: loading ? '...' : stats.total_students, color: '#e8f5e9', accent: '#2e7d32' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '24px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16
                }}>
                  <div style={{
                    width: 52, height: 52,
                    background: s.color,
                    borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24
                  }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: s.accent }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── BATCHES ── */}
        {activeMenu === 'batches' && (
          <>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, color: '#1a237e' }}>Batches</h2>
            <p style={{ margin: '0 0 24px', color: '#888', fontSize: 14 }}>All batches and their attendance</p>

            <div style={{ display: 'grid', gap: 12 }}>
              {loading ? (
                <div style={{ color: '#888', fontSize: 14 }}>Loading batches...</div>
              ) : batches.length === 0 ? (
                <div style={{ color: '#888', fontSize: 14 }}>No batches found.</div>
              ) : batches.map(batch => {
                const s = batchSummaries[batch.id]
                return (
                  <div key={batch.id} style={{
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 12,
                    padding: '18px 22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1a237e' }}>📦 {batch.name}</div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
                      <span style={{ color: '#2e7d32', fontWeight: 600 }}>✅ Present: {s ? s.present : '...'}</span>
                      <span style={{ color: '#c62828', fontWeight: 600 }}>❌ Absent: {s ? s.absent : '...'}</span>
                      <span style={{ color: '#f57f17', fontWeight: 600 }}>⏰ Late: {s ? s.late : '...'}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

      </div>
    </div>
  )
}