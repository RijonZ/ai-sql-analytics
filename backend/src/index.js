require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/query', require('./routes/query'));
app.use('/api/schema', require('./routes/schema'));
app.use('/api/upload', require('./routes/upload'));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
