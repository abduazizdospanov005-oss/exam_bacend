import { Response } from 'express';
import { AuthRequest } from '../types';
import { setExamEndTime, getExamEndTime, deleteExamTimer } from '../services/redis';
import prisma from '../lib/prisma';

/** POST /api/attempts/start */
export async function startAttempt(req: AuthRequest, res: Response): Promise<void> {
  const { examId, customDuration } = req.body;

  try {
    const exam = await prisma.exam.findUnique({
      where:   { id: parseInt(examId), isPublished: true },
      include: {
        questions: {
          include: { question: { include: { category: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) { res.status(404).json({ success: false, error: 'Exam topilmadi' }); return; }

    // Faol urinish borligini tekshirish
    const existing = await prisma.examAttempt.findFirst({
      where: { examId: parseInt(examId), userId: req.user!.id, status: 'IN_PROGRESS' },
    });
    if (existing) {
      let endTime = await getExamEndTime(existing.id);
      // Fallback: Redis key expired — recalculate from startedAt + exam.duration
      if (!endTime) {
        endTime = new Date(new Date(existing.startedAt).getTime() + exam.duration * 60 * 1000);
        await setExamEndTime(existing.id, endTime);
      }
      const existingQuestions = exam.questions.map(eq => ({
        id:       eq.question.id,
        text:     eq.question.text,
        type:     eq.question.type,
        points:   eq.question.points,
        imageUrl: eq.question.imageUrl,
        options:  eq.question.options,
      }));
      res.json({ success: true, data: { attempt: existing, endTime, questions: existingQuestions, duration: exam.duration } });
      return;
    }

    const attempt = await prisma.examAttempt.create({
      data: { examId: parseInt(examId), userId: req.user!.id },
    });

    const durationMinutes = customDuration ? parseInt(customDuration) : exam.duration;
    const endTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    await setExamEndTime(attempt.id, endTime);

    // Savollarni shuffle qilish
    let questions = exam.questions.map(eq => eq.question);
    if (exam.shuffleQuestions) questions = questions.sort(() => Math.random() - 0.5);

    const questionsForStudent = questions.map(q => ({
      id:       q.id,
      text:     q.text,
      type:     q.type,
      points:   q.points,
      imageUrl: q.imageUrl,
      options:  exam.shuffleOptions && Array.isArray(q.options)
        ? (q.options as string[]).sort(() => Math.random() - 0.5)
        : q.options,
    }));

    res.status(201).json({ success: true, data: { attempt, endTime, questions: questionsForStudent, duration: exam.duration } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/attempts/:id/answer */
export async function saveAnswer(req: AuthRequest, res: Response): Promise<void> {
  const attemptId  = parseInt(req.params.id);
  const { questionId, selectedOption, textAnswer } = req.body;

  try {
    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, userId: req.user!.id, status: 'IN_PROGRESS' },
    });
    if (!attempt) { res.status(404).json({ success: false, error: 'Faol urinish topilmadi' }); return; }

    const answer = await prisma.answer.upsert({
      where:  { attemptId_questionId: { attemptId, questionId: parseInt(questionId) } },
      update: { selectedOption, textAnswer },
      create: { attemptId, questionId: parseInt(questionId), selectedOption, textAnswer },
    });

    res.json({ success: true, data: answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/attempts/:id/submit */
export async function submitAttempt(req: AuthRequest, res: Response): Promise<void> {
  const attemptId = parseInt(req.params.id);

  try {
    const attempt = await prisma.examAttempt.findFirst({
      where:   { id: attemptId, userId: req.user!.id, status: 'IN_PROGRESS' },
      include: {
        answers: true,
        exam:    { include: { questions: { include: { question: true } } } },
      },
    });
    if (!attempt) { res.status(404).json({ success: false, error: 'Faol urinish topilmadi' }); return; }

    // Avtomatik baholash
    let totalScore = 0;
    const updates: Promise<unknown>[] = [];

    for (const eq of attempt.exam.questions) {
      const q      = eq.question;
      const answer = attempt.answers.find(a => a.questionId === q.id);
      if (!answer) continue;

      let isCorrect = false;
      let points    = 0;

      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
        isCorrect = answer.selectedOption === q.correctAnswer;
        points    = isCorrect ? q.points : 0;
      }
      // SHORT_ANSWER — o'qituvchi tekshiradi (isCorrect = false qoladi)

      totalScore += points;
      updates.push(
        prisma.answer.update({
          where: { id: answer.id },
          data:  { isCorrect, pointsEarned: points },
        })
      );
    }

    await Promise.all(updates);

    const status = req.body.timedOut ? 'TIMED_OUT' : 'SUBMITTED';
    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data:  { status, submittedAt: new Date(), score: totalScore },
    });

    await deleteExamTimer(attemptId);

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/attempts/:id */
export async function getAttempt(req: AuthRequest, res: Response): Promise<void> {
  try {
    const attempt = await prisma.examAttempt.findFirst({
      where:   { id: parseInt(req.params.id), userId: req.user!.id },
      include: { answers: true, exam: true },
    });
    if (!attempt) { res.status(404).json({ success: false, error: 'Topilmadi' }); return; }

    const endTime = await getExamEndTime(attempt.id);
    res.json({ success: true, data: { ...attempt, endTime } });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}
