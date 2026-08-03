import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Next.js frontend on localhost:3000
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express Body Parsers with high payload limit for Base64 multimodal images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Routes
app.use('/api/chat', chatRouter);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Nova AI Backend Server is running successfully!',
    healthCheck: '/api/health',
    chatEndpoint: '/api/chat'
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nova AI Customer Support & Sales Backend',
    timestamp: new Date().toISOString()
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Nova AI Backend listening on http://localhost:${PORT}`);
  console.log(`📡 API Chat Endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`=================================================`);
});
