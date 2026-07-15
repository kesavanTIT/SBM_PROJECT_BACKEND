import { AppError } from '../middlewares/error.middleware.js';
import prisma from '../config/db.js';

export const getAllBranches = async (req, res, next) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: branches.length,
      data: { branches },
    });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const { name, address, latitude, longitude, geofenceRadius } = req.body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return next(new AppError('Please provide name, address, latitude, and longitude', 400));
    }

    const branch = await prisma.branch.create({
      data: {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        geofenceRadius: geofenceRadius ? parseInt(geofenceRadius) : 300,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { branch },
    });
  } catch (error) {
    next(error);
  }
};

export const getBranchById = async (req, res, next) => {
  try {
    const branch = await prisma.branch.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!branch) return next(new AppError('Branch not found', 404));

    res.status(200).json({ status: 'success', data: { branch } });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const { name, address, latitude, longitude, geofenceRadius } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (geofenceRadius !== undefined) updateData.geofenceRadius = parseInt(geofenceRadius);

    const branch = await prisma.branch.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });

    res.status(200).json({ status: 'success', data: { branch } });
  } catch (error) {
    if (error.code === 'P2025') return next(new AppError('Branch not found', 404));
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    await prisma.branch.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    if (error.code === 'P2025') return next(new AppError('Branch not found', 404));
    next(error);
  }
};
