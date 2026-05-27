const Listing = require("./models/listing");
const Review = require("./models/review");


// Check Login
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {

    // Save Current Url
    req.session.redirectUrl = req.originalUrl;

    req.flash("error", "You Must Be Logged In To Continue!");

    // Save Session
    return req.session.save(() => {
      return res.redirect("/login");
    });
  }

  next();
};


// Save Redirect Url
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }

  next();
};


// Check Listing Owner
module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing Not Found!");
      return res.redirect("/listings");
    }

    if (
      !res.locals.currUser ||
      !listing.owner.equals(res.locals.currUser._id)
    ) {
      req.flash("error", "You Are Not The Owner Of This Listing!");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong!");
    return res.redirect("/listings");
  }
};


// Check Review Author
module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review Not Found!");
      return res.redirect(`/listings/${id}`);
    }

    if (
      !res.locals.currUser ||
      !review.author.equals(res.locals.currUser._id)
    ) {
      req.flash("error", "You Are Not The Author Of This Review!");
      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (err) {
    console.log(err);
    req.flash("error", "Something Went Wrong!");
    return res.redirect("/listings");
  }
};