const cors = require('cors');
const express = require('express');
const connectDB = require('./db');

const app = express();
const PORT = 3000;

// Parse JSON first
app.use(express.json());

// ✅ Use robust CORS config
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Routes
const crateRoutes = require('./routes/crates');
console.log('📡 Mounting crate routes at /api/crates');
app.use('/api/crates', crateRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const notificationsRoute = require('./routes/notifications');
app.use('/api/notifications', notificationsRoute);


const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);



// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
