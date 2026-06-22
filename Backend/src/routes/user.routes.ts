import { Router } from 'express';
import { getProfile } from '../controllers/user.controller';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/users/profile
router.get('/profile', auth, getProfile);

export default router;
