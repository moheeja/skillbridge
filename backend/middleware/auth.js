const sql = require('../db');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Decode JWT token (works without Clerk SDK verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Decode the payload part
    const base64Payload = parts[1];
    const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
    const payload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'));
    
    const clerkUserId = payload.sub;

    if (!clerkUserId) {
      return res.status(401).json({ error: 'Invalid token - no user ID' });
    }

    // Find user in our database
    const users = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${clerkUserId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    req.user = users[0];
    next();

  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Auth failed: ' + err.message });
  }
};

module.exports = authMiddleware;