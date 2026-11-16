const express = require('express');
const db = require('../db');
const { notify } = require('../lib/mailer');

const router = express.Router();

// Tiny in-memory rate limit: 6 submissions / 10 min per IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

router.post('/requests', (req, res) => {
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot — bots fill it, people don't see it
  if (limited(req.ip)) return res.status(429).json({ error: 'Too many requests — try again in a few minutes.' });

  const r = {
    kind: b.kind === 'cart' ? 'cart' : 'hello',
    name: clean(b.name, 120),
    email: clean(b.email, 160),
    phone: clean(b.phone, 40),
    event_date: clean(b.event_date, 40),
    guests: clean(b.guests, 40),
    location: clean(b.location, 200),
    message: clean(b.message, 2000),
  };

  if (!r.name) return res.status(400).json({ error: 'Please add your name.' });
  if (!r.email && !r.phone) return res.status(400).json({ error: 'Add an email or phone so we can get back to you.' });
  if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) return res.status(400).json({ error: 'That email looks off.' });

  db.insert.run(r);
  notify(r);
  res.json({ ok: true });
});

module.exports = router;
