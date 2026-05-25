import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  enableOfflineQueue: false,
  retryStrategy: () => null, // Redis bo'lmasa ham server ishlasin
});

redis.on('connect',  () => console.log('✅ Redis ulandi'));
redis.on('error',    (e) => console.warn('⚠️  Redis ulanmadi (ixtiyoriy):', e.message));

/** Exam tugash vaqtini saqlash */
export async function setExamEndTime(attemptId: number, endTime: Date): Promise<void> {
  const ttl = Math.ceil((endTime.getTime() - Date.now()) / 1000);
  if (ttl > 0) {
    await redis.set(`exam:${attemptId}:endTime`, endTime.toISOString(), 'EX', ttl).catch(() => {});
  }
}

/** Exam tugash vaqtini olish */
export async function getExamEndTime(attemptId: number): Promise<Date | null> {
  const val = await redis.get(`exam:${attemptId}:endTime`).catch(() => null);
  return val ? new Date(val) : null;
}

/** Exam vaqtini o'chirish */
export async function deleteExamTimer(attemptId: number): Promise<void> {
  await redis.del(`exam:${attemptId}:endTime`).catch(() => {});
}

export default redis;
