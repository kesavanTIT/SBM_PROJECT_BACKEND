import { Router } from 'express';

const apiRouter = Router();

// Base api check route
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to SBM Project API v1',
  });
});

export default apiRouter;
