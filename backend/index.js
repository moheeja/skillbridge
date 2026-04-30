const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const sql = require('./db');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// ── REGISTER USER ──────────────────────────────────────────
app.post('/users/register', async (req, res) => {
  try {
    const { clerk_user_id, name, role } = req.body;
    const existing = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${clerk_user_id}
    `;
    if (existing.length > 0) return res.json(existing[0]);
    const user = await sql`
      INSERT INTO users (clerk_user_id, name, role)
      VALUES (${clerk_user_id}, ${name}, ${role})
      RETURNING *
    `;
    res.status(201).json(user[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET CURRENT USER ───────────────────────────────────────
app.get('/users/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// ── BATCHES ────────────────────────────────────────────────
app.post('/batches', authMiddleware, async (req, res) => {
  try {
    if (!['trainer', 'institution'].includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    const { name, institution_id } = req.body;
    const batch = await sql`
      INSERT INTO batches (name, institution_id)
      VALUES (${name}, ${institution_id || 1})
      RETURNING *
    `;
    res.status(201).json(batch[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/batches', authMiddleware, async (req, res) => {
  try {
    const batches = await sql`SELECT * FROM batches`;
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INVITE LINK ────────────────────────────────────────────
app.post('/batches/:id/invite', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ error: 'Forbidden' });
    const token = crypto.randomBytes(16).toString('hex');
    await sql`
      UPDATE batches SET invite_token = ${token} WHERE id = ${req.params.id}
    `;
    const link = `${process.env.FRONTEND_URL}/join/${req.params.id}?token=${token}`;
    res.json({ invite_link: link, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── JOIN BATCH ─────────────────────────────────────────────
app.post('/batches/:id/join', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ error: 'Only students can join' });
    const { token } = req.body;
    const batch = await sql`
      SELECT * FROM batches WHERE id = ${req.params.id} AND invite_token = ${token}
    `;
    if (batch.length === 0)
      return res.status(400).json({ error: 'Invalid invite token' });
    await sql`
      INSERT INTO batch_students (batch_id, student_id)
      VALUES (${req.params.id}, ${req.user.id})
      ON CONFLICT DO NOTHING
    `;
    res.json({ message: 'Joined batch successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SESSIONS ───────────────────────────────────────────────
app.post('/sessions', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ error: 'Forbidden' });
    const { batch_id, title, date, start_time, end_time } = req.body;
    const session = await sql`
      INSERT INTO sessions (batch_id, trainer_id, title, date, start_time, end_time)
      VALUES (${batch_id}, ${req.user.id}, ${title}, ${date}, ${start_time}, ${end_time})
      RETURNING *
    `;
    res.status(201).json(session[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET MY SESSIONS (trainer + student) ───────────────────
app.get('/sessions/my', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      const sessions = await sql`
        SELECT * FROM sessions
        WHERE trainer_id = ${req.user.id}
        ORDER BY date DESC
      `;
      return res.json(sessions);
    }

    if (req.user.role === 'student') {
      const sessions = await sql`
        SELECT
          s.id,
          s.title,
          s.date,
          s.start_time,
          s.end_time,
          a.status AS attendance_status
        FROM sessions s
        JOIN batch_students bs ON bs.batch_id = s.batch_id
        LEFT JOIN attendance a
          ON a.session_id = s.id
          AND a.student_id = ${req.user.id}
        WHERE bs.student_id = ${req.user.id}
        ORDER BY s.date DESC
      `;
      return res.json(sessions);
    }

    res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sessions/:id/attendance', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'trainer')
      return res.status(403).json({ error: 'Forbidden' });
    const records = await sql`
      SELECT a.*, u.name FROM attendance a
      JOIN users u ON u.id = a.student_id
      WHERE a.session_id = ${req.params.id}
    `;
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ATTENDANCE ─────────────────────────────────────────────
app.post('/attendance/mark', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student')
      return res.status(403).json({ error: 'Forbidden' });
    const { session_id, status } = req.body;
    const record = await sql`
      INSERT INTO attendance (session_id, student_id, status)
      VALUES (${session_id}, ${req.user.id}, ${status})
      ON CONFLICT (session_id, student_id)
      DO UPDATE SET status = ${status}
      RETURNING *
    `;
    res.json(record[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SUMMARIES ──────────────────────────────────────────────
app.get('/batches/:id/summary', authMiddleware, async (req, res) => {
  try {
    if (!['institution', 'programme_manager', 'monitoring_officer'].includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    const summary = await sql`
      SELECT
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'absent') AS absent,
        COUNT(a.id) FILTER (WHERE a.status = 'late') AS late,
        COUNT(a.id) AS total
      FROM sessions s
      LEFT JOIN attendance a ON a.session_id = s.id
      WHERE s.batch_id = ${req.params.id}
    `;
    res.json(summary[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/programme/summary', authMiddleware, async (req, res) => {
  try {
    if (!['programme_manager', 'monitoring_officer'].includes(req.user.role))
      return res.status(403).json({ error: 'Forbidden' });
    const summary = await sql`
      SELECT
        COUNT(a.id) FILTER (WHERE a.status = 'present') AS present,
        COUNT(a.id) FILTER (WHERE a.status = 'absent') AS absent,
        COUNT(a.id) FILTER (WHERE a.status = 'late') AS late,
        COUNT(a.id) AS total,
        COUNT(DISTINCT s.batch_id) AS total_batches,
        COUNT(DISTINCT a.student_id) AS total_students
      FROM sessions s
      LEFT JOIN attendance a ON a.session_id = s.id
    `;
    res.json(summary[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INSTITUTION STATS ──────────────────────────────────────
app.get('/institution/stats', authMiddleware, async (req, res) => {
  try {
    const batches = await sql`SELECT COUNT(*) FROM batches`
    const trainers = await sql`SELECT COUNT(*) FROM users WHERE role = 'trainer'`
    const students = await sql`SELECT COUNT(*) FROM users WHERE role = 'student'`

    res.json({
      total_batches: batches[0].count,
      total_trainers: trainers[0].count,
      total_students: students[0].count
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── START SERVER ───────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SkillBridge API running on port ${PORT}`);
});