import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';
import prisma from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let currentUser;
    if (decoded.role === 'staff') {
      currentUser = await prisma.staff.findUnique({
        where: { id: decoded.id },
      });
    } else {
      currentUser = await prisma.admin.findUnique({
        where: { id: decoded.id },
      });
    }

    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token does no longer exist.', 401)
      );
    }

    req.user = currentUser;
    req.user.role = decoded.role || 'admin';
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};
