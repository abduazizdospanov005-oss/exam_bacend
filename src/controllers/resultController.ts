import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

/** GET /api/results/my */
export async function getMyResults(req: AuthRequest, res: Response): Promise<void> {
  try {
    const results = await prisma.examAttempt.findMany({
      where:   { userId: req.user!.id, status: { not: 'IN_PROGRESS' } },
      include: {
        exam: { select: { title: true, totalPoints: true, duration: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/results/:attemptId */
export async function getResult(req: AuthRequest, res: Response): Promise<void> {
  try {
    const attempt = await prisma.examAttempt.findUnique({
      where:   { id: parseInt(req.params.attemptId) },
      include: {
        exam: { select: { title: true, totalPoints: true } },
        answers: {
          include: {
            question: { select: { text: true, type: true, options: true, correctAnswer: true, points: true, imageUrl: true } },
          },
        },
      },
    });

    if (!attempt) { res.status(404).json({ success: false, error: 'Natija topilmadi' }); return; }

    const isOwner       = attempt.userId === req.user!.id;
    const isAdminOrTeacher = ['ADMIN', 'TEACHER'].includes(req.user!.role);
    if (!isOwner && !isAdminOrTeacher) {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' }); return;
    }

    res.json({ success: true, data: attempt });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/results/leaderboard */
export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true, name: true,
        attempts: {
          where: { status: { not: 'IN_PROGRESS' } },
          select: { score: true, status: true, exam: { select: { totalPoints: true } } },
        },
      },
    });

    const rankings = students
      .map(s => {
        const total  = s.attempts.length;
        const passed = s.attempts.filter(a => a.exam.totalPoints > 0 && (a.score / a.exam.totalPoints) >= 0.6).length;
        const avgPct = total > 0
          ? Math.round(s.attempts.reduce((sum, a) =>
              sum + (a.exam.totalPoints > 0 ? (a.score / a.exam.totalPoints) * 100 : 0), 0) / total)
          : 0;
        return { id: s.id, name: s.name, total, passed, avgPct };
      })
      .filter(s => s.total > 0)
      .sort((a, b) => b.avgPct - a.avgPct || b.total - a.total)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    res.json({ success: true, data: rankings });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/results/exam/:examId/stats */
export async function getExamStats(req: AuthRequest, res: Response): Promise<void> {
  const examId = parseInt(req.params.examId);

  try {
    const attempts = await prisma.examAttempt.findMany({
      where:   { examId, status: { not: 'IN_PROGRESS' } },
      include: { user: { select: { name: true, email: true } } },
    });

    const exam = await prisma.exam.findUnique({
      where:  { id: examId },
      select: { totalPoints: true, title: true },
    });

    if (!attempts.length) {
      res.json({ success: true, data: { total: 0, avg: 0, passRate: 0, attempts: [], chartData: [] } });
      return;
    }

    const passScore  = (exam?.totalPoints || 100) * 0.6;
    const total      = attempts.length;
    const passed     = attempts.filter(a => a.score >= passScore).length;
    const avg        = attempts.reduce((s, a) => s + a.score, 0) / total;

    // Ball taqsimoti
    const buckets = Array(10).fill(0);
    attempts.forEach(a => {
      const pct = exam?.totalPoints ? (a.score / exam.totalPoints) * 100 : 0;
      const idx = Math.min(Math.floor(pct / 10), 9);
      buckets[idx]++;
    });

    res.json({
      success: true,
      data: {
        total, passed, failed: total - passed,
        passRate: Math.round((passed / total) * 100),
        avgScore: Math.round(avg * 10) / 10,
        maxScore: Math.max(...attempts.map(a => a.score)),
        minScore: Math.min(...attempts.map(a => a.score)),
        chartData: {
          labels: ['0-10%','11-20%','21-30%','31-40%','41-50%','51-60%','61-70%','71-80%','81-90%','91-100%'],
          data:   buckets,
        },
        attempts: attempts.map(a => ({
          id:          a.id,
          user:        a.user,
          score:       a.score,
          status:      a.status,
          submittedAt: a.submittedAt,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}
