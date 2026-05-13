const express = require("express");

const router = express.Router({
  mergeParams: true
});

const wrapAsync =
  require("../utils/wrapAsync.js");

const ExpressError =
  require("../utils/ExpressError.js");

const multer =
  require("multer");

const {
  storage
} = require("../cloudConfig.js");

const upload = multer({
  storage
});

const {
  listingSchema
} = require("../schema.js");

const {
  isLoggedIn,
  isOwner,
} = require("../middleware.js");

const listingController =
  require("../controllers/listings.js");

const User =
  require("../models/user.js");

const Listing =
  require("../models/listing.js");


// Listing Validation Middleware

const validateListing = (
  req,
  res,
  next
) => {

  let { error } =
    listingSchema.validate(
      req.body
    );

  if (error) {

    let errMsg =
      error.details
        .map(
          (el) => el.message
        )
        .join(",");

    throw new ExpressError(
      400,
      errMsg
    );

  }

  next();

};


// Index Route & Create Route

router
  .route("/")

  .get(

    wrapAsync(
      listingController.index
    )

  )

  .post(

    isLoggedIn,

    upload.array(
      "listing[images]",
      3
    ),

    validateListing,

    wrapAsync(
      listingController.createListing
    )

  );


// New Route

router.get(

  "/new",

  isLoggedIn,

  listingController.renderNewForm

);


// Category Route

router.get(

  "/category/:category",

  wrapAsync(async (
    req,
    res
  ) => {

    const { category } =
      req.params;

    const listings =
      await Listing.find({

        category: category,

      });

    res.render(

      "listings/index.ejs",

      {

        listings,

      }

    );

  })

);


// Search Listings Route

router.get(

  "/search",

  wrapAsync(async (
    req,
    res
  ) => {

    const query =
      req.query.query;

    const regex =
      new RegExp(query, "i");

    const listings =
      await Listing.find({

        $or: [

          { title: regex },

          { location: regex },

          { country: regex }

        ]

      });

    res.render(
      "listings/index",
      { listings }
    );

  })

);


// Your Listings Route

router.get(

  "/my-listings",

  isLoggedIn,

  wrapAsync(async (
    req,
    res
  ) => {

    const listings =
      await Listing.find({

        owner:
          req.user._id

      });

    res.render(

      "listings/myListings.ejs",

      { listings }

    );

  })

);


// Wishlist Page Route ❤️

router.get(

  "/wishlist",

  isLoggedIn,

  wrapAsync(async (
    req,
    res
  ) => {

    const user =
      await User.findById(
        req.user._id
      ).populate(
        "wishlist"
      );

    res.render(
      "listings/wishlist",
      {
        wishlist:
          user.wishlist
      }
    );

  })

);


// Add To Wishlist Route ❤️

router.post(

  "/wishlist/:id",

  isLoggedIn,

  wrapAsync(async (
    req,
    res
  ) => {

    const listingId =
      req.params.id;

    const user =
      await User.findById(
        req.user._id
      );

    if (

      !user.wishlist.includes(
        listingId
      )

    ) {

      user.wishlist.push(
        listingId
      );

      await user.save();

      req.flash(
        "success",
        "Listing added to wishlist ❤️"
      );

    }

    res.redirect(
      "/listings"
    );

  })

);


// Remove From Wishlist ❤️

router.delete(

  "/wishlist/:id",

  isLoggedIn,

  wrapAsync(async (
    req,
    res
  ) => {

    const listingId =
      req.params.id;

    await User.findByIdAndUpdate(

      req.user._id,

      {
        $pull: {
          wishlist:
            listingId
        }
      }

    );

    req.flash(
      "success",
      "Removed from wishlist"
    );

    res.redirect(
      "/wishlist"
    );

  })

);


// Show Route, Update Route & Delete Route

router
  .route("/:id")

  .get(

    wrapAsync(
      listingController.showListing
    )

  )

  .put(

    isLoggedIn,

    isOwner,

    upload.array(
      "listing[images]",
      3
    ),

    validateListing,

    wrapAsync(
      listingController.updateListing
    )

  )

  .delete(

    isLoggedIn,

    isOwner,

    wrapAsync(
      listingController.destroyListing
    )

  );


// Edit Route

router.get(

  "/:id/edit",

  isLoggedIn,

  isOwner,

  wrapAsync(
    listingController.renderEditForm
  )

);


module.exports = router;