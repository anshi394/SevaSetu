require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sevasetu')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to SevaSetu API' });
});

// Import Routes
const uploadRoutes = require('./routes/upload');
const moduleRoutes = require('./routes/modules');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/volunteer', require('./routes/volunteer'));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
