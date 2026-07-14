import express from 'express';
import { getAllStaff, createStaff, getStaffById, updateStaff, deleteStaff } from '../controllers/staff.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // Protect all staff routes

router.route('/')
  .get(getAllStaff)
  .post(createStaff);

router.route('/:id')
  .get(getStaffById)
  .put(updateStaff)
  .delete(deleteStaff);

export default router;
