const User = require("../models/user.js");

// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};


// Signup User
module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Clean Input
    username = username.trim();
    email = email.trim().toLowerCase();

    // Check Username
    const existingUser = await User.findOne({
      username: {
        $regex: new RegExp("^" + username + "$", "i"),
      },
    });

    if (existingUser) {
      req.flash("error", "Username Already Exists!");
      return res.redirect("/signup");
    }

    // Check Email
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      req.flash("error", "Email Already Registered!");
      return res.redirect("/signup");
    }

    // Create User
    const newUser = new User({ email, username });

    // Register User
    const registeredUser = await User.register(newUser, password);

    // Auto Login
    req.login(registeredUser, (err) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/signup");
      }

      req.flash("success", `Welcome To Wanderlust, ${username}!`);
      res.redirect("/listings");
    });
  } catch (err) {
    console.log(err);
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};


// Render Login Form
module.exports.renderLoginForm = (req, res) => {
  let loginError = null;

  // Book Now Login Message
  if (req.query.message === "loginRequired") {
    loginError = "You Must Be Logged In To Book Listings!";
  }

  res.render("users/login.ejs", { loginError });
};


// Login User
module.exports.login = async (req, res) => {
  req.flash("success", `Welcome Back, ${req.user.username}!`);

  const redirectUrl = res.locals.redirectUrl || "/listings";

  // Clear Redirect URL
  delete req.session.redirectUrl;

  req.session.save(() => {
    res.redirect(redirectUrl);
  });
};


// Logout User
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "You Are Logged Out!");
    res.redirect("/listings");
  });
};