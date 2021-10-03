import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add some text'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'please add a rating between 1 and 10'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Get average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: '$bootcamp',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.error(error);
  }
};

// call getAverageRating after save()
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// call getAverageRating before remove()
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// prevent user from submitting more than a review for a boot camp
ReviewSchema.index(
  {
    bootcamp: 1,
    user: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model('Review', ReviewSchema);
