import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    User.findById(decoded.userId).select('-password').then(user => {
      if (!user) {
        res.status(401).json({ message: 'Invalid token.' });
        return;
      }
      (req as any).user = user;
      next();
    }).catch(() => {
      res.status(401).json({ message: 'Invalid token.' });
      return;
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
    return;
  }
}; 