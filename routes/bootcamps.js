import express from 'express';
import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsByLocation,
  BootcampPhotoUpload,
} from '../controllers/bootcamps.js';

import advancedResults from '../middleware/advancedResults.js';
import { protect, authorize } from '../middleware/auth.js';
import Bootcamp from '../models/Bootcamp.js';

// Include other resource routers
import courseRouter from './courses.js';
import reviewRouter from './reviews.js';

const router = express.Router();

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('admin', 'publisher'), createBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('admin', 'publisher'), BootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsByLocation);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('admin', 'publisher'), updateBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

export default router;
