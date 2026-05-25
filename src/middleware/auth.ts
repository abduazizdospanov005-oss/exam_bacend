import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AuthRequest, JwtPayload } from '../types';

/** JWT tokenni tekshirish */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token      = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Token topilmadi' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Token yaroqsiz' });
  }
}

/** Rol tekshirish */
export function authorizeRoles(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Ruxsat yo\'q' });
      return;
    }
    next();
  };
}
