const path = require('path');
const express = require('express');
const db = require('../db');
const auth = require('../lib/auth');

const router = express.Router();
const adminDir = path.join(__dirname, '..', 'admin');

// Pages: login when signed out, dashboard when signed in.
router.get(['/admin', '/admin/'], (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.sendFile(path.join(adminDir, auth.isAuthed(req) ? 'dashboard.html' : 'login.html'));
});
router.get('/admin/admin.css', (req, res) => res.sendFile(path.join(adminDir, 'admin.css')));
router.get('/admin/dashboard.js', auth.requireAuth, (req, res) => res.sendFile(path.join(adminDir, 'dashboard.js')));

// Auth
router.post('/admin/login', express.urlencoded({ extended: false }), (req, res) => {
  if (!auth.enabled()) return res.redirect('/admin?e=off');
  if (!auth.passwordMatches(req.body.password)) return res.redirect('/admin?e=bad');
  auth.issue(res);
  res.redirect('/admin');
});
router.post('/admin/logout', (req, res) => {
  auth.clear(res);
  res.redirect('/admin');
});

// API (all require a session)
router.get('/admin/api/requests', auth.requireAuth, (req, res) => {
  res.json({ statuses: db.STATUSES, requests: db.list.all() });
});
router.patch('/admin/api/requests/:id', auth.requireAuth, (req, res) => {
  const status = req.body && req.body.status;
  if (!db.STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
  const info = db.setStatus.run(status, Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});
router.delete('/admin/api/requests/:id', auth.requireAuth, (req, res) => {
  const info = db.remove.run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
