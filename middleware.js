const Listing = require("./models/listing");
const Review = require("./models/review");


// =============================
// CHECK LOGIN
// =============================

module.exports.isLoggedIn = (

  req,
  res,
  next

) => {

  if (!req.isAuthenticated()) {

    // SAVE CURRENT URL

    req.session.redirectUrl =
      req.originalUrl;

    // COMMON LOGIN MESSAGE

    req.flash(

      "error",

      "You must be logged in to continue!"

    );

    // SAVE SESSION

    return req.session.save(() => {

      return res.redirect("/login");

    });

  }

  next();

};


// =============================
// SAVE REDIRECT URL
// =============================

module.exports.saveRedirectUrl = (

  req,
  res,
  next

) => {

  if (req.session.redirectUrl) {

    res.locals.redirectUrl =
      req.session.redirectUrl;

  }

  next();

};


// =============================
// CHECK LISTING OWNER
// =============================

module.exports.isOwner = async (

  req,
  res,
  next

) => {

  try {

    const { id } = req.params;

    const listing =
      await Listing.findById(id);

    if (!listing) {

      req.flash(

        "error",

        "Listing not found!"

      );

      return res.redirect("/listings");

    }

    if (

      !res.locals.currUser ||

      !listing.owner.equals(
        res.locals.currUser._id
      )

    ) {

      req.flash(

        "error",

        "You are not the owner of this listing!"

      );

      return res.redirect(`/listings/${id}`);

    }

    next();

  } catch (err) {

    console.log(err);

    req.flash(

      "error",

      "Something went wrong!"

    );

    return res.redirect("/listings");

  }

};


// =============================
// CHECK REVIEW AUTHOR
// =============================

module.exports.isReviewAuthor = async (

  req,
  res,
  next

) => {

  try {

    const { id, reviewId } = req.params;

    const review =
      await Review.findById(reviewId);

    if (!review) {

      req.flash(

        "error",

        "Review not found!"

      );

      return res.redirect(`/listings/${id}`);

    }

    if (

      !res.locals.currUser ||

      !review.author.equals(
        res.locals.currUser._id
      )

    ) {

      req.flash(

        "error",

        "You are not the author of this review!"

      );

      return res.redirect(`/listings/${id}`);

    }

    next();

  } catch (err) {

    console.log(err);

    req.flash(

      "error",

      "Something went wrong!"

    );

    return res.redirect("/listings");

  }

};