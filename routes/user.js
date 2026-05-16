const express = require("express");
const passport = require("passport");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


// Signup Route
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));


// Login Route
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    async (req, res) => {
      req.flash("success", "Logged In Successfully!");

      let redirectUrl = res.locals.redirectUrl || "/listings";

      delete req.session.redirectUrl;

      // Session Save Fix
      req.session.save(() => {
        res.redirect(redirectUrl);
      });
    }
  );


// Logout Route
router.get(
  "/logout",
  userController.logout
);


module.exports = router;