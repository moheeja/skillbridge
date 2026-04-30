import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function StudentDashboard() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [sessions, setSessions] = useState([])
  const [joinToken, setJoinToken] = useState('')
  const [batchId, setBatchId] = useState('')

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const token = await getToken()
      const res = await axios.get(`${API}/sessions/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data)
    } catch { setSessions([]) }
  }

  const markAttendance = async (sessionId, status) => {
    const token = await getToken()
    await axios.post(`${API}/attendance/mark`,
      { session_id: sessionId, status },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert(`Marked as ${status}!`)
    fetchSessions()

  }

  const joinBatch = async () => {
    const token = await getToken()
    try {
      await axios.post(`${API}/batches/${batchId}/join`,
        { token: joinToken },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Joined batch successfully!')
      fetchSessions()
    } catch (err) {
      alert('Failed to join: ' + err.response?.data?.error)
    }
  }

  const total = sessions.length
  const present = sessions.filter(s => s.attendance_status === 'present').length
  const absent = sessions.filter(s => s.attendance_status === 'absent').length
  const late = sessions.filter(s => s.attendance_status === 'late').length

  return (
    <div style={{ maxWidth: 750, margin: '40px auto', padding: '0 20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
  <h1 style={{ fontSize: 26, fontWeight: 700 }}>🎓 Student Dashboard</h1>
  <button
    onClick={() => signOut()}
    style={{
      padding: '8px 16px',
      background: '#fee2e2',
      color: '#dc2626',
      border: 'none',
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer'
    }}
  >
    🚪 Sign Out
  </button>
</div>
<p style={{ color: '#888', marginBottom: 28 }}>Welcome back!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total',   value: total,   color: '#2563eb' },
          { label: 'Present', value: present, color: '#16a34a' },
          { label: 'Absent',  value: absent,  color: '#dc2626' },
          { label: 'Late',    value: late,    color: '#d97706' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20, marginBottom: 28 }}>
        <h3 style={{ marginBottom: 14, fontSize: 15 }}>🔗 Join a Batch</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder="Batch ID" value={batchId} onChange={e => setBatchId(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: 120 }} />
          <input placeholder="Invite Token" value={joinToken} onChange={e => setJoinToken(e.target.value)}
            style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, flex: 1, minWidth: 160 }} />
          <button onClick={joinBatch} style={{ padding: '9px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Join</button>
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>📋 My Sessions</h2>
      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb' }}>
          No sessions yet. Join a batch first!
        </div>
      )}
      {sessions.map(s => (
        <div key={s.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{s.title}</div>
          <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>📅 {s.date} &nbsp; ⏰ {s.start_time} - {s.end_time}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => markAttendance(s.id, 'present')} style={{ padding: '6px 14px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✓ Present</button>
            <button onClick={() => markAttendance(s.id, 'late')} style={{ padding: '6px 14px', background: '#fef9c3', color: '#d97706', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>⏰ Late</button>
            <button onClick={() => markAttendance(s.id, 'absent')} style={{ padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✗ Absent</button>
          </div>
        </div>
      ))}
    </div>
  )
}