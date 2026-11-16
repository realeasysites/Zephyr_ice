// Password-only admin auth. No username. Disabled until ADMIN_PASSWORD is set.
const crypto = require('crypto');

const COOKIE = 'zi_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function enabled() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function passwordMatches(input) {
  if (!enabled() || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

function issue(res) {
  const exp = String(Date.now() + MAX_AGE_MS);
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  });
}

function clear(res) {
  res.clearCookie(COOKIE);
}

function isAuthed(req) {
  const raw = req.cookies && req.cookies[COOKIE];
  if (!raw || !enabled()) return false;
  const [exp, sig] = raw.split('.');
  if (!exp || !sig) return false;
  const expected = sign(exp);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(exp) > Date.now();
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  return res.status(401).json({ error: 'Not signed in' });
}

module.exports = { enabled, passwordMatches, issue, clear, isAuthed, requireAuth };
