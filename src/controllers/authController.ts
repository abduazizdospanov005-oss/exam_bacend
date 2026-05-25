import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import prisma from '../lib/prisma';

/** POST /api/auth/register */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, role = 'STUDENT' } = req.body;

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(400).json({ success: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
    );

    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ success: false, error: 'Foydalanuvchi topilmadi' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ success: false, error: 'Parol noto\'g\'ri' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
    );

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}

/** GET /api/auth/me */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server xatosi' });
  }
}
