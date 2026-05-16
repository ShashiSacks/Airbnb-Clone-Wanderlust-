const express = require("express");

const router = express.Router({
  mergeParams: true,
});

const multer = require("multer");

const {
  storage,
} = require("../cloudConfig.js");

const upload = multer({
  storage,
});

const wrapAsync =
  require("../utils/wrapAsync.js");

const ExpressError =
  require("../utils/ExpressError.js");

const {
  listingSchema,
} = require("../schema.js");

const {
  isLoggedIn,
  isOwner,
} = require("../middleware.js");

const listingController =
  require("../controllers/listings.js");

const Listing =
  require("../models/listing.js");


// Validation Middleware
const validateListing = (
  req,
  res,
  next
) => {

  const { error } =
    listingSchema.validate(
      req.body
    );

  if (error) {

    const errMsg =
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


// Index Route + Create Route
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

  wrapAsync(
    async (req, res) => {

      const { category } =
        req.params;

      const listings =
        await Listing.find({
          category,
        });

      res.render(
        "listings/index",
        {
          listings,
        }
      );
    }
  )
);


// Search Route
router.get(

  "/search",

  wrapAsync(
    async (req, res) => {

      const query =
        req.query.query;

      const regex =
        new RegExp(
          query,
          "i"
        );

      const listings =
        await Listing.find({

          $or: [

            {
              title: regex,
            },

            {
              location: regex,
            },

            {
              country: regex,
            },
          ],
        });

      res.render(
        "listings/index",
        {
          listings,
        }
      );
    }
  )
);


// My Listings Route
router.get(

  "/my-listings",

  isLoggedIn,

  wrapAsync(
    async (req, res) => {

      const listings =
        await Listing.find({
          owner:
            req.user._id,
        });

      res.render(
        "listings/mylistings",
        {
          listings,
        }
      );
    }
  )
);


// Show + Update + Delete
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