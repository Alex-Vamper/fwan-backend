import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import connectDB from './db.js'; // <-- note the .js extension

// Route imports
import crateRoutes from './routes/crates.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import notificationsRoute from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = 3000;

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:8080',
  'https://fwan-admin.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests like Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Middleware
app.use(express.json());

// ✅ Mount routes
console.log('📡 Mounting routes...');
app.use('/api/crates', crateRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationsRoute);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// ✅ Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
