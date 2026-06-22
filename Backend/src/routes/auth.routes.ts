import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

export default router;
