import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errorHandler';

interface JwtPayload {
  _id: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, 'some-secret-key') as JwtPayload;

    (req as AuthRequest).user = payload;

    return next();
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
};
