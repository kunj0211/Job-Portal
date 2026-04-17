require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Example of a Protected Route
app.get('/api/protected', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'You have accessed a protected route!',
    user: req.user // Decoded token details are available here
  });
});

// Basic endpoint
app.get('/', (req, res) => {
  res.send('Job Portal API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
