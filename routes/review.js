const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");


// Create Review
router.post(
  "/",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id);

      if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect("/listings");
      }

      if (
        !req.body.review ||
        !req.body.review.rating ||
        req.body.review.rating < 1
      ) {
        req.flash("error", "Please Select A Rating!");
        return res.redirect(`/listings/${id}`);
      }

      if (
        !req.body.review.comment ||
        req.body.review.comment.trim() === ""
      ) {
        req.flash("error", "Review Comment Cannot Be Empty!");
        return res.redirect(`/listings/${id}`);
      }

      const newReview = new Review(req.body.review);
      newReview.author = req.user._id;
      listing.reviews.push(newReview);
      await newReview.save();
      await listing.save();

      req.flash("success", "Review Posted Successfully!");
      res.redirect(`/listings/${listing._id}`);
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      res.redirect(`/listings/${req.params.id}`);
    }
  })
);


// Delete Review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/listings/${id}`);
  })
);


module.exports = router;