import { useAuth } from '@clerk/clerk-react'
import { useClerk } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function MonitoringDashboard() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [summary, setSummary] = useState(null)

  // Fetch data when page loads
  useEffect(() => {
    getToken().then(token =>
      axios.get(`${API}/programme/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSummary(res.data))
    )
  }, [])

  // Calculate attendance rate
  const rate = summary
    ? Math.round((summary.present / summary.total) * 100) || 0
    : 0

  // Show loading screen while fetching
  if (!summary) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, fontFamily: 'Segoe UI' }}>
        <div style={{ fontSize: 36 }}>⏳</div>
        <p style={{ color: '#888', marginTop: 12 }}>Loading data...</p>
      </div>
    )
  }

  // Table rows data
  const rows = [
    { metric: 'Total Records', value: summary.total,   badge: null },
    { metric: 'Present',       value: summary.present, badge: 'present' },
    { metric: 'Absent',        value: summary.absent,  badge: 'absent' },
    { metric: 'Late',          value: summary.late,    badge: 'late' },
  ]

  // Badge color helper
  const badgeStyle = (type) => {
    const map = {
      present: { background: '#dcfce7', color: '#15803d' },
      absent:  { background: '#fee2e2', color: '#b91c1c' },
      late:    { background: '#fef9c3', color: '#92400e' },
    }
    return {
      display: 'inline-block',
      padding: '3px 12px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      ...(map[type] || { background: '#f3f4f6', color: '#374151' })
    }
  }

  return (
    <div style={{
      maxWidth: 720,
      margin: '40px auto',
      padding: '0 20px',
      fontFamily: 'Segoe UI, sans-serif'
    }}>

      {/* Header */}
          <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
            Monitoring Officer
          </h1>
          <button
            onClick={() => signOut()}
            style={{
              padding: '8px 16px', background: '#fee2e2',
              color: '#dc2626', border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}
          >
            🚪 Sign Out
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
          — Read Only &nbsp;·&nbsp; You have read-only access to programme data.
        </p>
      </div>

      {/* Attendance Rate Banner */}
      <div style={{
        background: rate >= 75 ? '#f0fdf4' : rate >= 50 ? '#fffbeb' : '#fef2f2',
        border: `1px solid ${rate >= 75 ? '#bbf7d0' : rate >= 50 ? '#fde68a' : '#fecaca'}`,
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>
            📈 OVERALL ATTENDANCE RATE
          </div>
          <div style={{
            fontSize: 42,
            fontWeight: 800,
            color: rate >= 75 ? '#15803d' : rate >= 50 ? '#b45309' : '#b91c1c'
          }}>
            {rate}%
          </div>
        </div>
        {/* Mini progress bar */}
        <div style={{ width: 160 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, textAlign: 'right' }}>
            {summary.present} / {summary.total} present
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: 99, height: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${rate}%`,
              background: rate >= 75 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444',
              borderRadius: 99,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 20px',
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Metric</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Count</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>Status</span>
        </div>

        {/* Table Rows */}
        {rows.map((row, i) => (
          <div key={row.metric} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '14px 20px',
            borderBottom: i < rows.length - 1 ? '1px solid #f3f4f6' : 'none',
            alignItems: 'center',
            background: i % 2 === 0 ? '#fff' : '#fafafa'
          }}>
            <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{row.metric}</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{row.value}</span>
            <span style={{ textAlign: 'center' }}>
              {row.badge
                ? <span style={badgeStyle(row.badge)}>{row.badge}</span>
                : <span style={badgeStyle(null)}>total</span>
              }
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}