 CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student','trainer','institution','programme_manager','monitoring_officer')),
  institution_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  institution_id INTEGER NOT NULL,
  invite_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_trainers (
  batch_id INTEGER REFERENCES batches(id),
  trainer_id INTEGER REFERENCES users(id),
  PRIMARY KEY (batch_id, trainer_id)
);

CREATE TABLE IF NOT EXISTS batch_students (
  batch_id INTEGER REFERENCES batches(id),
  student_id INTEGER REFERENCES users(id),
  PRIMARY KEY (batch_id, student_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER REFERENCES batches(id),
  trainer_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  student_id INTEGER REFERENCES users(id),
  status TEXT CHECK (status IN ('present','absent','late')),
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);
