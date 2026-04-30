import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { loginValidator, signupValidator } from '../validators/authValidators.js';

const router = express.Router();

router.post('/signup', signupValidator, validateRequest, signup);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', protect, getMe);

export default router;