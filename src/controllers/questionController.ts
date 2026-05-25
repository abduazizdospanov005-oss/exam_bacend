import { Response } from 'express';
import { AuthRequest } from '../types';
import { uploadImage } from '../services/cloudinary';
import prisma from '../lib/prisma';

/** GET /api/questions */
export async function getQuestions(req: AuthRequest, res: Response): Promise<void> {
  const { search, categoryId, type, page = '1', limit = '20' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where: Record<string, unknown> = {};
    if (search)     where.text       = { contains: search, mode: 'insensitive' };
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (type)       where.type       = type;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where, skip, take: parseInt(limit),
        include: { category: true, createdBy: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({ success: true, data: { questions, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/questions/:id */
export async function getQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const q = await prisma.question.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { category: true, createdBy: { select: { name: true } } },
    });
    if (!q) { res.status(404).json({ success: false, error: 'Savol topilmadi' }); return; }
    res.json({ success: true, data: q });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/questions */
export async function createQuestion(req: AuthRequest, res: Response): Promise<void> {
  const { text, type, options, correctAnswer, points, categoryId } = req.body;

  try {
    const q = await prisma.question.create({
      data: {
        text, type, correctAnswer,
        points:     parseInt(points) || 1,
        options:    options || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        createdById: req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** PUT /api/questions/:id */
export async function updateQuestion(req: AuthRequest, res: Response): Promise<void> {
  const { text, type, options, correctAnswer, points, categoryId } = req.body;

  try {
    const q = await prisma.question.update({
      where: { id: parseInt(req.params.id) },
      data:  { text, type, options, correctAnswer, points: parseInt(points), categoryId: categoryId ? parseInt(categoryId) : null },
    });
    res.json({ success: true, data: q });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** DELETE /api/questions/:id */
export async function deleteQuestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.question.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Savol o\'chirildi' });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/questions/:id/upload-image */
export async function uploadQuestionImage(req: AuthRequest, res: Response): Promise<void> {
  if (!req.file) { res.status(400).json({ success: false, error: 'Rasm yuklanmagan' }); return; }

  try {
    const url = await uploadImage(req.file.buffer, 'exam-questions');
    const q   = await prisma.question.update({
      where: { id: parseInt(req.params.id) },
      data:  { imageUrl: url },
    });
    res.json({ success: true, data: { imageUrl: q.imageUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Rasm yuklashda xato' });
  }
}

/** GET /api/categories */
export async function getCategories(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: cats });
  } catch {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}
