import Course from '../models/Course.js';
import ErrorResponse from '../utilis/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import Bootcamp from '../models/Bootcamp.js';

// @desc  Get all courses
// @route GET /api/v1/courses
// @route GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
export const getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.bootcampId) {
    query = Course.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Course.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc  Get single course
// @route GET /api/v1/courses/:id
// @access Public
export const getCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  const course = await Course.findById(courseId).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${courseId}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc  Add a course
// @route POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
export const addCourse = asyncHandler(async (req, res, next) => {
  const bootcampId = req.params.bootcampId;

  req.body.bootcamp = bootcampId;

  const bootcamp = await Bootcamp.findById(bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`bootcamp not found with id of ${bootcampId}`, 404)
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc  update a course
// @route PUT /api/v1/bootcamps/courses/:id
// @access Private
export const updateCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  let course = await Course.findById(courseId);

  if (!course) {
    return next(
      new ErrorResponse(`course not found with id of ${courseId}`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc  delete a course
// @route DELETE /api/v1/bootcamps/courses/:id
// @access Private
export const deleteCourse = asyncHandler(async (req, res, next) => {
  const courseId = req.params.id;

  let course = await Course.findById(courseId);

  if (!course) {
    return next(
      new ErrorResponse(`course not found with id of ${courseId}`, 404)
    );
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
