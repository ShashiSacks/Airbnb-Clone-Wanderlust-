const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const wishlistController = require("../controllers/wishlist.js");


// Wishlist Page
router.get(
  "/", 
  isLoggedIn, 
  wrapAsync(wishlistController.renderWishlist));


// Add To Wishlist
router.post(
  "/:id", 
  isLoggedIn, 
  wrapAsync(wishlistController.addToWishlist));


// Remove From Wishlist
router.delete(
  "/:id", 
  isLoggedIn, 
  wrapAsync(wishlistController.removeFromWishlist));


// Remove Route Support
router.post(
  "/remove/:id", 
  isLoggedIn, 
  wrapAsync(wishlistController.removeFromWishlist));


module.exports = router;