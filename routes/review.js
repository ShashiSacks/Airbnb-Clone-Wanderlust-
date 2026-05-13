const express = require("express");

const router = express.Router({
  mergeParams: true
});

const wrapAsync =
  require("../utils/wrapAsync.js");

const ExpressError =
  require("../utils/ExpressError.js");

const {
  reviewSchema
} = require("../schema.js");

const Review =
  require("../models/review.js");

const Listing =
  require("../models/listing.js");

const {
  isLoggedIn,
  isReviewAuthor
} = require("../middleware.js");


// Review Validation

const validateReview = (
  req,
  res,
  next
) => {

  let {
    error
  } = reviewSchema.validate(
    req.body
  );

  if (error) {

    let errMsg =
      error.details
        .map((el) => el.message)
        .join(",");

    throw new ExpressError(
      400,
      errMsg
    );

  }

  next();

};


// Create Review

router.post(

  "/",

  isLoggedIn,

  validateReview,

  wrapAsync(async (

    req,
    res

  ) => {

    const {
      id
    } = req.params;

    const listing =
      await Listing.findById(id);

    if (!listing) {

      throw new ExpressError(
        404,
        "Listing not found"
      );

    }

    const newReview =
      new Review(
        req.body.review
      );

    newReview.author =
      req.user._id;

    listing.reviews.push(
      newReview
    );

    await newReview.save();

    await listing.save();

    req.flash(
      "success",
      "New Review Created!"
    );

    res.redirect(
      `/listings/${id}`
    );

  })

);


// Edit Review Page

router.get(

  "/:reviewId/edit",

  isLoggedIn,

  isReviewAuthor,

  wrapAsync(async (

    req,
    res

  ) => {

    const {
      id,
      reviewId
    } = req.params;

    const listing =
      await Listing.findById(id);

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {

      req.flash(
        "error",
        "Review Not Found!"
      );

      return res.redirect(
        `/listings/${id}`
      );

    }

    res.render(

      "reviews/edit.ejs",

      {
        listing,
        review
      }

    );

  })

);


// Update Review

router.put(

  "/:reviewId",

  isLoggedIn,

  isReviewAuthor,

  validateReview,

  wrapAsync(async (

    req,
    res

  ) => {

    const {
      id,
      reviewId
    } = req.params;

    await Review.findByIdAndUpdate(

      reviewId,

      {
        ...req.body.review
      }

    );

    req.flash(
      "success",
      "Review Updated!"
    );

    res.redirect(
      `/listings/${id}`
    );

  })

);


// Delete Review

router.delete(

  "/:reviewId",

  isLoggedIn,

  isReviewAuthor,

  wrapAsync(async (

    req,
    res

  ) => {

    const {
      id,
      reviewId
    } = req.params;

    await Listing.findByIdAndUpdate(

      id,

      {
        $pull: {
          reviews: reviewId
        }
      }

    );

    await Review.findByIdAndDelete(
      reviewId
    );

    req.flash(
      "success",
      "Review Deleted!"
    );

    res.redirect(
      `/listings/${id}`
    );

  })

);


module.exports = router;