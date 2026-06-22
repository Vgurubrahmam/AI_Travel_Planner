import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export const logger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    };

    if (env.NODE_ENV === 'development') {
      const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
      const reset = '\x1b[0m';
      console.log(
        `${color}${logEntry.method} ${logEntry.path} ${logEntry.status}${reset} - ${logEntry.duration}`
      );
    } else {
      console.log(JSON.stringify(logEntry));
    }
  });

  next();
};
