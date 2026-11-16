// Zephyr Ice — thin entry point. Logic lives in routes/ and lib/.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Admin first, so /admin always asks for the password before any static file is served.
app.use(adminRoutes);
app.use('/api', publicRoutes);

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`Zephyr Ice running on http://localhost:${PORT}`));
