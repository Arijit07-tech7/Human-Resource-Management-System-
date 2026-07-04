const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const socketIO = require('socket.io');
const app = require('./app');
const connectDB = require('./server/config/db');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

global.io = io;

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();
        console.log('✅ Database connected successfully');
      } catch (dbError) {
        console.warn('⚠️  Database connection failed. Continuing in UI-only mode with Mock Data.');
        console.warn(`Error detail: ${dbError.message}`);
      }
    } else {
      console.log('⚠️  No MONGODB_URI configured. Running in UI-only mode with Mock Data.');
    }

    server.listen(PORT, () => {
      console.log(`🚀 PeopleCore HRMS running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
