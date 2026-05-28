const express = require("express");

const router =
  express.Router({
    mergeParams: true,
  });

const multer =
  require("multer");

const { storage } =
  require("../cloudConfig.js");

const upload =
  multer({ storage });

const wrapAsync =
  require("../utils/wrapAsync.js");

const ExpressError =
  require("../utils/ExpressError.js");

const { listingSchema } =
  require("../schema.js");

const {
  isLoggedIn,
  isOwner,
} = require("../middleware.js");

const listingController =
  require("../controllers/listings.js");

const Listing =
  require("../models/listing.js");



// =====================================================
// VALIDATION MIDDLEWARE
// =====================================================

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
          (el) =>
            el.message
        )
        .join(",");

    throw new ExpressError(
      400,
      errMsg
    );
  }

  next();
};



// =====================================================
// INDEX ROUTE + CREATE ROUTE
// =====================================================

router
  .route("/")

  .get(

    wrapAsync(
      async (
        req,
        res
      ) => {

        const listings =
          await Listing.find({});

        res.render(

          "listings/index",

          {

            listings,

            selectedCategory:
              null,

            searchQuery: "",

          }
        );
      }
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



// =====================================================
// NEW ROUTE
// =====================================================

router.get(

  "/new",

  isLoggedIn,

  listingController.renderNewForm
);



// =====================================================
// TRENDING ROUTE
// =====================================================

router.get(

  "/trending",

  wrapAsync(
    async (
      req,
      res
    ) => {

      const listings =
        await Listing.find({

          isTrending: true,
        });

      res.render(

        "listings/index",

        {

          listings,

          selectedCategory:
            "Trending",

          searchQuery: "",

        }
      );
    }
  )
);



// =====================================================
// CATEGORY ROUTE
// =====================================================

router.get(

  "/category/:category",

  wrapAsync(
    async (
      req,
      res
    ) => {

      const {
        category,
      } = req.params;

      const listings =
        await Listing.find({

          category,
        });

      res.render(

        "listings/index",

        {

          listings,

          selectedCategory:
            category,

          searchQuery: "",

        }
      );
    }
  )
);



// =====================================================
// SEARCH ROUTE
// =====================================================

router.get(

  "/search",

  wrapAsync(
    async (
      req,
      res
    ) => {

      const query =
        req.query.query;

      // EMPTY SEARCH FIX

      if (
        !query ||
        query.trim() === ""
      ) {

        return res.redirect(
          "/listings"
        );
      }

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

            {
              category: regex,
            },

          ],
        });

      res.render(

        "listings/index",

        {

          listings,

          selectedCategory:
            null,

          searchQuery:
            query,

        }
      );
    }
  )
);



// =====================================================
// MY LISTINGS ROUTE
// =====================================================

router.get(

  "/my-listings",

  isLoggedIn,

  wrapAsync(
    async (
      req,
      res
    ) => {

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



// =====================================================
// SHOW + UPDATE + DELETE ROUTES
// =====================================================

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



// =====================================================
// EDIT ROUTE
// =====================================================

router.get(

  "/:id/edit",

  isLoggedIn,

  isOwner,

  wrapAsync(
    listingController.renderEditForm
  )
);



// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
  router;