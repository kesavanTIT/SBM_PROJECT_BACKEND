import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/error.middleware.js';
import prisma from '../config/db.js';

const signToken = (id, role = 'admin') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(admin.id, 'admin');

    res.status(200).json({
      status: 'success',
      token,
      data: {
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const staffLogin = async (req, res, next) => {
  try {
    const { email, staffId } = req.body;

    if (!email || !staffId) {
      return next(new AppError('Please provide email and staffId', 400));
    }

    const staff = await prisma.staff.findUnique({
      where: { email },
    });

    // Check if staff exists and staffId matches (case-insensitive or exact? exact is better)
    if (!staff || staff.staffId !== staffId) {
      return next(new AppError('Incorrect email or staff ID', 401));
    }

    const token = signToken(staff.id, 'staff');

    res.status(200).json({
      status: 'success',
      token,
      data: {
        staff: {
          id: staff.id,
          staffId: staff.staffId,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          whatsappNumber: staff.whatsappNumber,
          address: staff.address,
          city: staff.city,
          state: staff.state,
          zipCode: staff.zipCode,
          joinDate: staff.joinDate,
          photoUrl: staff.photoUrl,
          status: staff.status
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
