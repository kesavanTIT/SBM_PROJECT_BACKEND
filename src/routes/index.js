import { Router } from 'express';
import authRoutes from './auth.routes.js';
import staffRoutes from './staff.routes.js';
import attendanceRoutes from './attendance.routes.js';

const apiRouter = Router();

apiRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to SBM Project API v1',
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/staff', staffRoutes);
apiRouter.use('/attendance', attendanceRoutes);

export default apiRouter;
