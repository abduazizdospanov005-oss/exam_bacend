import 'dotenv/config';
import express    from 'express';
import cors       from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import routes from './routes/index';
import { getExamEndTime, deleteExamTimer } from './services/redis';
import prisma from './lib/prisma';

const app    = express();
const server = createServer(app);

const io = new SocketServer(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Socket.IO — Real-time taymer ──────────────
io.on('connection', (socket) => {
  socket.on('join:attempt', async (attemptId: number) => {
    socket.join(`attempt:${attemptId}`);

    const endTime = await getExamEndTime(attemptId);
    if (endTime) {
      socket.emit('timer:sync', { endTime: endTime.toISOString() });

      const interval = setInterval(async () => {
        const remaining = endTime.getTime() - Date.now();
        if (remaining <= 0) {
          clearInterval(interval);
          io.to(`attempt:${attemptId}`).emit('timer:expired');
          // Avtomatik submit
          try {
            const att = await prisma.examAttempt.findFirst({
              where: { id: attemptId, status: 'IN_PROGRESS' },
            });
            if (att) {
              await prisma.examAttempt.update({
                where: { id: attemptId },
                data:  { status: 'TIMED_OUT', submittedAt: new Date() },
              });
              await deleteExamTimer(attemptId);
            }
          } catch {}
        } else {
          io.to(`attempt:${attemptId}`).emit('timer:tick', { remaining: Math.ceil(remaining / 1000) });
        }
      }, 1000);

      socket.on('disconnect', () => clearInterval(interval));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO tayyor`);
});

export { io };
