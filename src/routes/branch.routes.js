import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getAllBranches,
  createBranch,
  getBranchById,
  updateBranch,
  deleteBranch,
} from '../controllers/branch.controller.js';

const branchRouter = Router();

branchRouter.use(protect);

branchRouter.route('/').get(getAllBranches).post(createBranch);
branchRouter.route('/:id').get(getBranchById).put(updateBranch).delete(deleteBranch);

export default branchRouter;
