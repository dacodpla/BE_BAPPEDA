// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the Vue app can fetch data
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173' // Vue's default Vite port
}));

app.use(express.json());

// Sample API route
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the Express backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
