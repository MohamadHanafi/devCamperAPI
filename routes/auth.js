import express from 'express';
import {
  getMe,
  login,
  register,
  forgetPassword,
  resetPassword,
  updateDetails,
  UpdatePassword,
  logout,
} from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, UpdatePassword);
router.post('/forgetpassword', forgetPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
