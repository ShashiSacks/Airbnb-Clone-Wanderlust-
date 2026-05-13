const express = require("express");

const router = express.Router();

const User =
  require("../models/user.js");

const Listing =
  require("../models/listing.js");

const { isLoggedIn } =
  require("../middleware.js");


// Add To Wishlist

router.post(

  "/:id",

  isLoggedIn,

  async (req, res) => {

    const listing =
      await Listing.findById(
        req.params.id
      );

    if (!listing) {

      req.flash(
        "error",
        "Listing not found!"
      );

      return res.redirect(
        "/listings"
      );

    }

    const user =
      await User.findById(
        req.user._id
      );

    const alreadyExists =
      user.wishlist.includes(
        listing._id
      );

    if (!alreadyExists) {

      user.wishlist.push(
        listing._id
      );

      await user.save();

    }

    req.flash(
      "success",
      "Listing added to wishlist!"
    );

    res.redirect(
      req.get("Referrer") || "/listings"
    );

  }

);


// Wishlist Page

router.get(

  "/",

  isLoggedIn,

  async (req, res) => {

    const user =
      await User.findById(
        req.user._id
      ).populate("wishlist");

    res.render(
      "listings/wishlist.ejs",
      {
        wishlists: user.wishlist
      }
    );

  }

);


// Remove From Wishlist

router.delete(

  "/:id",

  isLoggedIn,

  async (req, res) => {

    await User.findByIdAndUpdate(

      req.user._id,

      {

        $pull: {

          wishlist:
            req.params.id

        }

      }

    );

    req.flash(
      "success",
      "Listing removed from wishlist!"
    );

    res.redirect(
      req.get("Referrer") || "/wishlists"
    );

  }

);


module.exports = router;