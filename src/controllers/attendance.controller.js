import { AppError } from '../middlewares/error.middleware.js';
import prisma from '../config/db.js';

// Haversine formula to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

export const checkIn = async (req, res, next) => {
  try {
    const { latitude, longitude, branchId } = req.body;
    const staffId = req.user.id;

    if (req.user.role !== 'staff') {
      return next(new AppError('Only staff members can perform this action', 403));
    }

    if (!latitude || !longitude) {
      return next(new AppError('Location coordinates are required for check-in', 400));
    }

    // ── Resolve branch ──────────────────────────────────────────────────────
    // Priority:
    //   1. branchId passed from the staff dashboard (locked to their assigned branch)
    //   2. Staff's assigned branch from DB
    // If neither exists → reject. No env/hardcoded fallback allowed.
    let branch;

    if (branchId) {
      branch = await prisma.branch.findUnique({ where: { id: parseInt(branchId) } });
      if (!branch) {
        return next(new AppError('Selected branch not found. Contact admin.', 404));
      }
    } else {
      // Look up staff's assigned branch
      const staffRecord = await prisma.staff.findUnique({
        where: { id: staffId },
        include: { branch: true },
      });
      branch = staffRecord?.branch || null;
    }

    if (!branch) {
      return next(
        new AppError(
          'You are not assigned to any office branch. Please contact admin to assign your branch before checking in.',
          403
        )
      );
    }

    // ── Geofence check using branch coordinates ─────────────────────────────
    const distance = calculateDistance(
      latitude,
      longitude,
      branch.latitude,
      branch.longitude
    );

    if (distance > branch.geofenceRadius) {
      return next(
        new AppError(
          `You are ${Math.round(distance)} meters away from ${branch.name}. You must be within ${branch.geofenceRadius} meters to check-in.`,
          403
        )
      );
    }

    const todayDate = getTodayDateString();

    // Check if already checked in today
    const existingRecord = await prisma.attendance.findUnique({
      where: { staffId_date: { staffId, date: todayDate } },
    });

    if (existingRecord) {
      return next(new AppError('You have already checked in today', 400));
    }

    const checkInTime = new Date();

    // Check if late (after 09:45 local time)
    const hr = checkInTime.getHours();
    const min = checkInTime.getMinutes();
    let shiftStatus = 'On Time';
    if (hr > 9 || (hr === 9 && min > 45)) {
      shiftStatus = 'Late';
    }

    const attendance = await prisma.attendance.create({
      data: {
        staffId,
        branchId: branch.id,
        branchName: branch.name,
        date: todayDate,
        checkIn: checkInTime,
        status: shiftStatus,
        latitude,
        longitude,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};


export const checkOut = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    if (req.user.role !== 'staff') {
      return next(new AppError('Only staff members can perform this action', 403));
    }
    const todayDate = getTodayDateString();

    const existingRecord = await prisma.attendance.findUnique({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
    });

    if (!existingRecord) {
      return next(new AppError('You have not checked in today', 400));
    }

    if (existingRecord.checkOut) {
      return next(new AppError('You have already checked out today', 400));
    }

    const checkOutTime = new Date();
    
    // Calculate total hours
    const diffMs = checkOutTime - new Date(existingRecord.checkIn);
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    const totalHoursStr = `${hours} hours ${minutes} mins`;

    // 9 hours 15 mins (09:30 to 18:45) = 555 mins
    const REQUIRED_MINS = 555; 
    let pendingHoursStr = null;
    let overtimeHoursStr = null;
    let finalStatus = existingRecord.status; // Preserve "Late" if any

    if (diffMins < REQUIRED_MINS) {
      const pendingMins = REQUIRED_MINS - diffMins;
      pendingHoursStr = `${Math.floor(pendingMins / 60)} hours ${pendingMins % 60} mins`;
      finalStatus = finalStatus === "Late" ? "Late & Early Left" : "Early Left";
    } else if (diffMins > REQUIRED_MINS) {
      const overMins = diffMins - REQUIRED_MINS;
      overtimeHoursStr = `${Math.floor(overMins / 60)} hours ${overMins % 60} mins`;
      if (finalStatus !== "Late") finalStatus = "Completed";
    } else {
      if (finalStatus !== "Late") finalStatus = "Completed";
    }

    const attendance = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: checkOutTime,
        totalHours: totalHoursStr,
        status: finalStatus,
        pendingHours: pendingHoursStr,
        overtimeHours: overtimeHoursStr
      },
    });

    res.status(200).json({
      status: 'success',
      data: { attendance },
    });
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    if (req.user.role !== 'staff') {
      return next(new AppError('Only staff members can perform this action', 403));
    }
    const todayDate = getTodayDateString();

    const attendance = await prisma.attendance.findUnique({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: { attendance }, // null if not checked in yet
    });
  } catch (error) {
    next(error);
  }
};

export const getStaffHistory = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    if (req.user.role !== 'staff') {
      return next(new AppError('Only staff members can perform this action', 403));
    }
    
    const history = await prisma.attendance.findMany({
      where: { staffId },
      orderBy: { date: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    // Admin only
    if (req.user.role !== 'admin') {
      return next(new AppError('Not authorized', 403));
    }

    const { date, month, branchId } = req.query;
    
    let whereClause = {};
    if (date) {
      whereClause.date = date; // YYYY-MM-DD
    } else if (month) {
      whereClause.date = { startsWith: month };
    }
    if (branchId && branchId !== 'all') {
      whereClause.branchId = parseInt(branchId);
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        staff: {
          select: { id: true, name: true, staffId: true, photoUrl: true, branchId: true }
        }
      },
      orderBy: { date: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      results: attendanceRecords.length,
      data: { attendance: attendanceRecords },
    });
  } catch (error) {
    next(error);
  }
};
