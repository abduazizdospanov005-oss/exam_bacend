import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

/** GET /api/exams */
export async function getExams(req: AuthRequest, res: Response): Promise<void> {
  const isAdminOrTeacher = ['ADMIN', 'TEACHER'].includes(req.user!.role);

  try {
    const exams = await prisma.exam.findMany({
      where:   isAdminOrTeacher ? {} : { isPublished: true },
      include: {
        createdBy: { select: { name: true } },
        category:  { select: { id: true, name: true } },
        _count:    { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: exams });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/exams/:id */
export async function getExam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await prisma.exam.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: {
        createdBy: { select: { name: true } },
        questions: {
          include: { question: { include: { category: true } } },
          orderBy: { order: 'asc' },
        },
        _count: { select: { attempts: true } },
      },
    });
    if (!exam) { res.status(404).json({ success: false, error: 'Exam topilmadi' }); return; }
    res.json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/exams */
export async function createExam(req: AuthRequest, res: Response): Promise<void> {
  const { title, description, duration, shuffleQuestions, shuffleOptions, startTime, endTime } = req.body;

  try {
    const exam = await prisma.exam.create({
      data: {
        title, description,
        duration:         parseInt(duration),
        shuffleQuestions: shuffleQuestions || false,
        shuffleOptions:   shuffleOptions   || false,
        startTime:        startTime ? new Date(startTime) : null,
        endTime:          endTime   ? new Date(endTime)   : null,
        createdById:      req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** PUT /api/exams/:id */
export async function updateExam(req: AuthRequest, res: Response): Promise<void> {
  const { title, description, duration, shuffleQuestions, shuffleOptions, startTime, endTime } = req.body;

  try {
    const exam = await prisma.exam.update({
      where: { id: parseInt(req.params.id) },
      data:  {
        title, description,
        duration: parseInt(duration),
        shuffleQuestions, shuffleOptions,
        startTime: startTime ? new Date(startTime) : null,
        endTime:   endTime   ? new Date(endTime)   : null,
      },
    });
    res.json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** DELETE /api/exams/:id */
export async function deleteExam(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.exam.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Exam o\'chirildi' });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/exams/:id/questions */
export async function addQuestionsToExam(req: AuthRequest, res: Response): Promise<void> {
  const examId = parseInt(req.params.id);
  const { questions: incoming } = req.body as { questions: { questionId: number; order: number }[] };

  try {
    // Remove existing questions first, then re-add (full replace)
    await prisma.examQuestion.deleteMany({ where: { examId } });

    const qIds = incoming.map(q => q.questionId);
    const dbQuestions = await prisma.question.findMany({
      where:  { id: { in: qIds } },
      select: { id: true, points: true },
    });

    const pointsMap = new Map(dbQuestions.map(q => [q.id, q.points]));

    await prisma.examQuestion.createMany({
      data: incoming.map(q => ({ examId, questionId: q.questionId, order: q.order })),
      skipDuplicates: true,
    });

    const totalPoints = incoming.reduce((s, q) => s + (pointsMap.get(q.questionId) ?? 0), 0);
    await prisma.exam.update({ where: { id: examId }, data: { totalPoints } });

    res.json({ success: true, message: `${incoming.length} ta savol qo'shildi` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** DELETE /api/exams/:id/questions/:questionId */
export async function removeQuestionFromExam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const eq = await prisma.examQuestion.delete({
      where: {
        examId_questionId: {
          examId:     parseInt(req.params.id),
          questionId: parseInt(req.params.questionId),
        },
      },
      include: { question: { select: { points: true } } },
    });
    await prisma.exam.update({
      where: { id: parseInt(req.params.id) },
      data:  { totalPoints: { decrement: eq.question.points } },
    });
    res.json({ success: true, message: 'Savol olib tashlandi' });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/exams/:id/publish */
export async function publishExam(req: AuthRequest, res: Response): Promise<void> {
  try {
    const exam = await prisma.exam.update({
      where: { id: parseInt(req.params.id) },
      data:  { isPublished: true },
    });
    res.json({ success: true, data: exam });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}
