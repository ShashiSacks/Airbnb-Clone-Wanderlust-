const User =
  require("../models/user.js");


// ========================================
// RENDER SIGNUP FORM
// ========================================

module.exports.renderSignupForm = (
  req,
  res
) => {

  res.render(
    "users/signup.ejs"
  );

};


// ========================================
// SIGNUP USER
// ========================================

module.exports.signup = async (
  req,
  res
) => {

  try {

    let {
      username,
      email,
      password
    } = req.body;

    // Clean Input

    username =
      username.trim();

    email =
      email
        .trim()
        .toLowerCase();

    // Check Username

    const existingUser =
      await User.findOne({

        username: {

          $regex:
            new RegExp(
              "^" +
              username +
              "$",
              "i"
            ),

        },

      });

    if (existingUser) {

      req.flash(
        "error",
        "Username already exists!"
      );

      return res.redirect(
        "/signup"
      );

    }

    // Check Email

    const existingEmail =
      await User.findOne({
        email,
      });

    if (existingEmail) {

      req.flash(
        "error",
        "Email already registered!"
      );

      return res.redirect(
        "/signup"
      );

    }

    // Create User

    const newUser =
      new User({

        email,
        username,

      });

    // Register User

    const registeredUser =
      await User.register(
        newUser,
        password
      );

    // Auto Login

    req.login(
      registeredUser,
      (err) => {

        if (err) {

          req.flash(
            "error",
            err.message
          );

          return res.redirect(
            "/signup"
          );

        }

        req.flash(
          "success",
          `Welcome to Wanderlust, ${username}!`
        );

        res.redirect(
          "/listings"
        );

      }
    );

  } catch (err) {

    console.log(err);

    req.flash(
      "error",
      err.message
    );

    res.redirect(
      "/signup"
    );

  }

};


// ========================================
// RENDER LOGIN FORM
// ========================================

module.exports.renderLoginForm = (
  req,
  res
) => {

  res.render(
    "users/login.ejs"
  );

};


// ========================================
// LOGIN USER
// ========================================

module.exports.login = async (
  req,
  res
) => {

  req.flash(
    "success",
    `Welcome back, ${req.user.username}!`
  );

  const redirectUrl =
    res.locals.redirectUrl ||
    "/listings";

  // Clear Redirect URL

  delete req.session.redirectUrl;

  res.redirect(
    redirectUrl
  );

};


// ========================================
// LOGOUT USER
// ========================================

module.exports.logout = (
  req,
  res,
  next
) => {

  req.logout((err) => {

    if (err) {

      return next(err);

    }

    req.flash(
      "success",
      "You are logged out!"
    );

    res.redirect(
      "/listings"
    );

  });

};