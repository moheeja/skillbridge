import { useAuth } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useClerk } from '@clerk/clerk-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

const S = {
  wrap: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#f4f6fb' },
  sidebar: { width: 220, background: '#1e3a5f', color: '#fff', padding: '28px 0', display: 'flex', flexDirection: 'column' },
  sidebarTitle: { fontSize: 22, fontWeight: 700, padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: 1 },
  navItem: (active) => ({ padding: '12px 24px', cursor: 'pointer', background: active ? 'rgba(255,255,255,0.15)' : 'transparent', borderLeft: active ? '3px solid #60a5fa' : '3px solid transparent', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }),
  main: { flex: 1, padding: 32 },
  header: { fontSize: 22, fontWeight: 700, color: '#1e3a5f', marginBottom: 24 },
  card: { background: '#fff', borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1e3a5f', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
  input: { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 7, fontSize: 14, outline: 'none' },
  btn: (color) => ({ padding: '9px 20px', background: color || '#1e3a5f', color: '#fff', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: 'pointer' }),
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { background: '#f1f5f9', padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '11px 14px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  badge: (c) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c === 'blue' ? '#dbeafe' : '#f0fdf4', color: c === 'blue' ? '#1d4ed8' : '#15803d' }),
  inviteBox: { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 16, marginTop: 12 },
  inviteRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  copyBtn: { padding: '4px 12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
}

export default function TrainerDashboard() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [tab, setTab] = useState('sessions')
  const [sessions, setSessions] = useState([])
  const [batches, setBatches] = useState([])
  const [inviteData, setInviteData] = useState(null)
  const [form, setForm] = useState({ title: '', date: '', start_time: '', end_time: '', batch_id: '' })
  const [copied, setCopied] = useState('')

  useEffect(() => { fetchSessions(); fetchBatches() }, [])

  const fetchSessions = async () => {
    try {
      const token = await getToken()
      const res = await axios.get(`${API}/sessions/my`, { headers: { Authorization: `Bearer ${token}` } })
      setSessions(res.data)
    } catch { setSessions([]) }
  }

  const fetchBatches = async () => {
    try {
      const token = await getToken()
      const res = await axios.get(`${API}/batches`, { headers: { Authorization: `Bearer ${token}` } })
      setBatches(res.data)
    } catch { setBatches([]) }
  }

  const createSession = async () => {
    if (!form.title || !form.date || !form.batch_id) return alert('Please fill all fields!')
    const token = await getToken()
    try {
      await axios.post(`${API}/sessions`, form, { headers: { Authorization: `Bearer ${token}` } })
      alert('✅ Session created!')
      fetchSessions()
      setForm({ title: '', date: '', start_time: '', end_time: '', batch_id: '' })
    } catch (err) { alert('Error: ' + err.response?.data?.error) }
  }

  const generateInvite = async (batchId, batchName) => {
    const token = await getToken()
    try {
      const res = await axios.post(`${API}/batches/${batchId}/invite`, {}, { headers: { Authorization: `Bearer ${token}` } })
      setInviteData({ batchId, batchName, link: res.data.invite_link, token: res.data.token || res.data.invite_link?.split('token=')[1] })
    } catch (err) { alert('Error: ' + err.response?.data?.error) }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div style={S.wrap}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarTitle}>👨‍🏫 Trainer</div>
        {[
          { key: 'sessions', icon: '📋', label: 'My Sessions' },
          { key: 'create', icon: '➕', label: 'Create Session' },
          { key: 'invite', icon: '🔗', label: 'Batch Invites' },
        ].map(item => (
          <div key={item.key} style={S.navItem(tab === item.key)} onClick={() => setTab(item.key)}>
            {item.icon} {item.label}
          </div>
        ))}
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

      {/* Main */}
      <div style={S.main}>

        {/* Sessions Tab */}
        {tab === 'sessions' && (
          <>
            <div style={S.header}>📋 My Sessions</div>
            <div style={S.card}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  No sessions yet. <span style={{ color: '#1e3a5f', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTab('create')}>Create one →</span>
                </div>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Session Title</th>
                      <th style={S.th}>Date</th>
                      <th style={S.th}>Start Time</th>
                      <th style={S.th}>End Time</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id}>
                        <td style={S.td}><strong>{s.title}</strong></td>
                        <td style={S.td}>📅 {s.date}</td>
                        <td style={S.td}>⏰ {s.start_time}</td>
                        <td style={S.td}>{s.end_time}</td>
                        <td style={S.td}><span style={S.badge('blue')}>Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Create Session Tab */}
        {tab === 'create' && (
          <>
            <div style={S.header}>➕ Create New Session</div>
            <div style={S.card}>
              <div style={S.cardTitle}>📝 Session Details</div>
              <div style={{ display: 'grid', gap: 12 }}>
                <input style={{ ...S.input, width: '100%' }} placeholder="Session Title (e.g. Python Basics - Day 1)"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>DATE</label>
                    <input style={S.input} type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>START TIME</label>
                    <input style={S.input} type="time" value={form.start_time}
                      onChange={e => setForm({ ...form, start_time: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>END TIME</label>
                    <input style={S.input} type="time" value={form.end_time}
                      onChange={e => setForm({ ...form, end_time: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>BATCH</label>
                  <select style={{ ...S.input, width: 220 }} value={form.batch_id}
                    onChange={e => setForm({ ...form, batch_id: e.target.value })}>
                    <option value="">-- Select Batch --</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <button style={S.btn('#1e3a5f')} onClick={createSession}>Create Session →</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Invite Tab */}
        {tab === 'invite' && (
          <>
            <div style={S.header}>🔗 Batch Invite Links</div>
            <div style={S.card}>
              <div style={S.cardTitle}>📦 Your Batches</div>
              {batches.length === 0 ? (
                <p style={{ color: '#94a3b8' }}>No batches found.</p>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Batch ID</th>
                      <th style={S.th}>Batch Name</th>
                      <th style={S.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(b => (
                      <tr key={b.id}>
                        <td style={S.td}><span style={S.badge('blue')}>#{b.id}</span></td>
                        <td style={S.td}><strong>{b.name}</strong></td>
                        <td style={S.td}>
                          <button style={S.btn('#7c3aed')} onClick={() => generateInvite(b.id, b.name)}>
                            🔗 Generate Invite
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Invite Result */}
              {inviteData && (
                <div style={S.inviteBox}>
                  <p style={{ fontWeight: 700, color: '#0369a1', marginBottom: 12 }}>
                    ✅ Invite generated for <strong>{inviteData.batchName}</strong>
                  </p>

                  {/* Step 1: Batch ID */}
                  <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 7, padding: '10px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>STEP 1 — Give student this Batch ID</div>
                    <div style={S.inviteRow}>
                      <code style={{ fontSize: 18, fontWeight: 700, color: '#1e3a5f' }}>{inviteData.batchId}</code>
                      <button style={S.copyBtn} onClick={() => copy(String(inviteData.batchId), 'bid')}>
                        {copied === 'bid' ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Token */}
                  <div style={{ background: '#fff', border: '1px solid #e0f2fe', borderRadius: 7, padding: '10px 14px', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>STEP 2 — Give student this Invite Token</div>
                    <div style={S.inviteRow}>
                      <code style={{ fontSize: 13, color: '#7c3aed', wordBreak: 'break-all', flex: 1, marginRight: 8 }}>{inviteData.token}</code>
                      <button style={S.copyBtn} onClick={() => copy(inviteData.token, 'tok')}>
                        {copied === 'tok' ? '✅ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Instructions for student */}
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 7, padding: '10px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>📢 Tell your students:</div>
                    <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
                      <li>Go to <strong>Student Dashboard</strong></li>
                      <li>Enter Batch ID: <strong>{inviteData.batchId}</strong></li>
                      <li>Enter Invite Token (copied above)</li>
                      <li>Click <strong>Join</strong> ✅</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}