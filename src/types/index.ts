import { Role } from '@prisma/client';
import { Request } from 'express';

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
}
