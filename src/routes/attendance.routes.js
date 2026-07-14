import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getStaffHistory,
  getAllAttendance
} from '../controllers/attendance.controller.js';

const router = express.Router();

router.use(protect); // All attendance routes are protected

// Staff routes
router.post('/check-in', checkIn);
router.put('/check-out', checkOut);
router.get('/status', getTodayStatus);
router.get('/history', getStaffHistory);

// Admin route
router.get('/all', getAllAttendance);

export default router;
