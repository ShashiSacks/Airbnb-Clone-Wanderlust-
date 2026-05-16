const User = require("../models/user.js");
const Listing = require("../models/listing.js");


// Wishlist Page
module.exports.renderWishlist = async (req, res) => {

  const user = await User
    .findById(req.user._id)
    .populate("wishlist");

  res.render(
    "listings/wishlist",
    {
      wishlists: user.wishlist,
    }
  );
};


// Add To Wishlist
module.exports.addToWishlist = async (req, res) => {

  const listing =
    await Listing.findById(
      req.params.id
    );

  if (!listing) {

    req.flash(
      "error",
      "Listing Not Found!"
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

  if (alreadyExists) {

    req.flash(
      "error",
      "Listing Already In Wishlist!"
    );

    return res.redirect(
      req.get("Referrer") ||
      "/listings"
    );
  }

  user.wishlist.push(
    listing._id
  );

  await user.save();

  req.flash(
    "success",
    "Listing Added To Wishlist!"
  );

  res.redirect(
    req.get("Referrer") ||
    "/listings"
  );
};


// Remove From Wishlist
module.exports.removeFromWishlist =
  async (req, res) => {

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          wishlist:
            req.params.id,
        },
      }
    );

    req.flash(
      "success",
      "Listing Removed From Wishlist!"
    );

    res.redirect(
      req.get("Referrer") ||
      "/wishlists"
    );
  };