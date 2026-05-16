const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  
  // Comment Text
  comment: String,

  // Rating (1-5 Stars)
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  // Created Timestamp
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  // Author Reference
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);