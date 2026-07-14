import express from 'express';
import { login, staffLogin } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/staff-login', staffLogin);

export default router;
