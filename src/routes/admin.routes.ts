import express from 'express';
import { adminLogin } from '../controllers/admin.controller';
import { getAdminStats } from '../controllers/admin.controller';
import { protect, protectAdmin } from '../middleware/auth';

const router = express.Router();

router.post('/login', adminLogin);

router.get('/stats', protect, protectAdmin, getAdminStats);

export default router;