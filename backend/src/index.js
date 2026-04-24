require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

require('./cron/scheduler').initScheduler();

app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});


app.use('/api/health', require('./routes/health'));
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/tasks',  require('./routes/tasks'));
app.use('/api/study',  require('./routes/study'));


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
