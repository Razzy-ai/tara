import type{ Request, Response, NextFunction } from "express";

export const logger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log({
    method: req.method,
    path: req.path,
    time: new Date().toISOString(),
  });

  next();
};