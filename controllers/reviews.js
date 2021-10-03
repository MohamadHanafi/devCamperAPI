import Review from '../models/Review.js';
import Bootcamp from '../models/Bootcamp.js';
import ErrorResponse from '../utilis/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc  Get all reviews
// @route GET /api/v1/reviews
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
export const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    res
      .status(200)
      .json({ success: true, count: reviews.length, data: reviews });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc  Get single reviews
// @route GET /api/v1/reviews/:id
// @access Public
export const getReview = asyncHandler(async (req, res, next) => {
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!review) {
    return next(new ErrorResponse(`no review with the id ${reviewId}`, 404));
  }
  res.status(200).json({ success: true, data: review });
});

// @desc  add a review
// @route POST /api/v1/bootcamps/bootcampId/reviews
// @access Private
export const addReview = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;

  req.body.bootcamp = bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`no bootcamp with the id ${Bootcamp}`, 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc  update a review
// @route put /api/v1/reviews/:id
// @access Private
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`no review with the id ${req.params.id}`, 404)
    );
  }

  //make sure the review belong to the logged in user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`not authorized to update review ${req.params.id}`, 404)
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc  Delete a review
// @route DELETE /api/v1/reviews/:id
// @access Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`no review with the id ${req.params.id}`, 404)
    );
  }

  //make sure the review belong to the logged in user or admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`not authorized to update review ${req.params.id}`, 404)
    );
  }

  await Review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
