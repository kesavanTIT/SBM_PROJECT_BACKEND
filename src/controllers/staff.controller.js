import { AppError } from '../middlewares/error.middleware.js';
import prisma from '../config/db.js';

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { createdAt: 'desc' },
      include: { branch: { select: { id: true, name: true } } },
    });

    res.status(200).json({
      status: 'success',
      results: staff.length,
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const {
      staffId,
      name,
      joinDate,
      phone,
      whatsappNumber,
      email,
      address,
      city,
      state,
      zipCode,
      photoUrl,
      aadhaarNumber,
      aadhaarPhotoUrl,
      aadhaarPhotoBackUrl,
      branchId,
    } = req.body;

    const existingStaff = await prisma.staff.findUnique({
      where: { email },
    });

    if (existingStaff) {
      return next(new AppError('Staff with this email already exists', 400));
    }

    const data = {
      staffId,
      name,
      joinDate,
      phone,
      whatsappNumber,
      email,
      address,
      city,
      state,
      zipCode,
      photoUrl,
      aadhaarNumber,
      aadhaarPhotoUrl,
      aadhaarPhotoBackUrl,
    };
    if (branchId !== undefined) {
      data.branchId = branchId ? parseInt(branchId) : null;
    }

    const newStaff = await prisma.staff.create({
      data,
      include: { branch: { select: { id: true, name: true } } },
    });

    res.status(201).json({
      status: 'success',
      data: { staff: newStaff },
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffById = async (req, res, next) => {
  try {
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { branch: { select: { id: true, name: true } } },
    });
    if (!staff) return next(new AppError('Staff member not found', 404));

    res.status(200).json({ status: 'success', data: { staff } });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const {
      staffId,
      name,
      joinDate,
      phone,
      whatsappNumber,
      email,
      address,
      city,
      state,
      zipCode,
      photoUrl,
      aadhaarNumber,
      aadhaarPhotoUrl,
      aadhaarPhotoBackUrl,
      branchId,
      status
    } = req.body;

    const data = {
      staffId,
      name,
      joinDate,
      phone,
      whatsappNumber,
      email,
      address,
      city,
      state,
      zipCode,
      photoUrl,
      aadhaarNumber,
      aadhaarPhotoUrl,
      aadhaarPhotoBackUrl,
    };
    
    if (status !== undefined) {
      data.status = status;
    }

    if (branchId !== undefined) {
      data.branchId = branchId ? parseInt(branchId) : null;
    }

    const staff = await prisma.staff.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { branch: { select: { id: true, name: true } } },
    });

    res.status(200).json({ status: 'success', data: { staff } });
  } catch (error) {
    if (error.code === 'P2025') return next(new AppError('Staff member not found', 404));
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staffId = parseInt(req.params.id);

    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: { staffId },
      }),
      prisma.staff.delete({
        where: { id: staffId },
      }),
    ]);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    if (error.code === 'P2025') return next(new AppError('Staff member not found', 404));
    next(error);
  }
};
