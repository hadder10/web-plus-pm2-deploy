import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from '../utils/statusCodes';

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.NOT_FOUND;
  }
}

export class BadRequestError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.BAD_REQUEST;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.UNAUTHORIZED;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.FORBIDDEN;
  }
}

export class ConflictError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.CONFLICT;
  }
}

export class InternalServerError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }
}

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'На сервере произошла ошибка';

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.message;
  } else if (err.name === 'CastError' || err.name === 'SyntaxError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Переданы некорректные данные';
  } else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Пользователь с таким email уже существует';
  }

  res.status(statusCode).send({
    message: statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'На сервере произошла ошибка' : message,
  });
};

export default errorHandler;
