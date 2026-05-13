const Listing =
  require("./models/listing");

const Review =
  require("./models/review");


// Check Login

module.exports.isLoggedIn = (
  req,
  res,
  next
) => {

  if (
    !req.isAuthenticated()
  ) {

    // Save Redirect URL Only Once

    if (
      req.session &&
      !req.session.redirectUrl
    ) {

      req.session.redirectUrl =
        req.originalUrl;

    }

    req.flash(
      "error",
      "You must be logged in first!"
    );

    return res.redirect(
      "/login"
    );

  }

  next();

};


// Save Redirect URL

module.exports.saveRedirectUrl = (
  req,
  res,
  next
) => {

  if (
    req.session.redirectUrl
  ) {

    res.locals.redirectUrl =
      req.session.redirectUrl;

  }

  next();

};


// Check Listing Owner

module.exports.isOwner = async (
  req,
  res,
  next
) => {

  let { id } =
    req.params;

  const listing =
    await Listing.findById(id);


  if (!listing) {

    req.flash(
      "error",
      "Listing not found!"
    );

    return res.redirect(
      "/listings"
    );

  }


  if (
    !listing.owner.equals(
      res.locals.currUser._id
    )
  ) {

    req.flash(
      "error",
      "You are not the owner of this listing!"
    );

    return res.redirect(
      `/listings/${id}`
    );

  }

  next();

};


// Check Review Author

module.exports.isReviewAuthor =
  async (
    req,
    res,
    next
  ) => {

    let {
      id,
      reviewId
    } = req.params;

    const review =
      await Review.findById(
        reviewId
      );


    if (!review) {

      req.flash(
        "error",
        "Review not found!"
      );

      return res.redirect(
        `/listings/${id}`
      );

    }


    if (
      !review.author.equals(
        res.locals.currUser._id
      )
    ) {

      req.flash(
        "error",
        "You are not the author of this review!"
      );

      return res.redirect(
        `/listings/${id}`
      );

    }

    next();

  };