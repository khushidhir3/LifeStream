require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donors');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
