require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError =
  require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy =
  require("passport-local");

const GoogleStrategy =
  require("passport-google-oauth20").Strategy;

const Stripe = require("stripe");

const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY
);


// Models
const User =
  require("./models/user.js");

const Listing =
  require("./models/listing.js");


// Routes
const listingRouter =
  require("./routes/listing.js");

const reviewsRouter =
  require("./routes/review.js");

const userRouter =
  require("./routes/user.js");

const wishlistRouter =
  require("./routes/wishlist.js");

const {
  saveRedirectUrl,
  isLoggedIn,
} = require("./middleware.js");


// MongoDB
const dbUrl =
  process.env.ATLASDB_URL;

mongoose.set(
  "strictQuery",
  true
);

main()
  .then(() => {
    console.log("Connected To DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


// View Engine
app.set("view engine", "ejs");

app.set(
  "views",
  path.join(__dirname, "views")
);

app.engine("ejs", ejsMate);


// Middleware
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use(
  methodOverride("_method")
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// Mongo Session Store
const store =
  MongoStore.create({
    mongoUrl: dbUrl,
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
  });

store.on("error", (err) => {
  console.log(
    "Mongo Session Store Error",
    err
  );
});


// Session
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    expires: new Date(
      Date.now() +
      7 * 24 * 60 * 60 * 1000
    ),

    maxAge:
      7 * 24 * 60 * 60 * 1000,

    httpOnly: true,
  },
};

app.use(
  session(sessionOptions)
);

app.use(flash());


// Passport
app.use(passport.initialize());

app.use(passport.session());

passport.use(
  new LocalStrategy(
    User.authenticate()
  )
);


// Google Auth
passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.GOOGLE_CLIENT_ID,

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET,

      callbackURL:
        process.env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {

      try {

        // Existing Google User
        let existingUser =
          await User.findOne({
            googleId: profile.id,
          });

        if (existingUser) {
          return done(
            null,
            existingUser
          );
        }

        // Existing Normal Signup User
        let emailUser =
          await User.findOne({
            email:
              profile.emails?.[0]?.value,
          });

        if (emailUser) {

          emailUser.googleId =
            profile.id;

          await emailUser.save();

          return done(
            null,
            emailUser
          );
        }

        // New Google User
        const newUser =
          new User({

            username:
              profile.displayName
                .replace(/\s+/g, "")
                .toLowerCase() +
              Math.floor(
                Math.random() * 10000
              ),

            displayName:
              profile.displayName,

            email:
              profile.emails?.[0]?.value,

            googleId:
              profile.id,

            photo:
              profile.photos?.[0]?.value,
          });

        await User.register(
          newUser,
          Math.random()
            .toString(36)
        );

        return done(
          null,
          newUser
        );

      } catch (err) {

        return done(err, null);
      }
    }
  )
);

passport.serializeUser(
  User.serializeUser()
);

passport.deserializeUser(
  User.deserializeUser()
);


// Locals Middleware
app.use((req, res, next) => {

  let errors =
    req.flash("error") || [];

  errors = errors.map((err) => {

    if (!err) return "";

    const errorMessage =
      typeof err === "string"
        ? err
        : err.message ||
          "Something went wrong";

    if (
      errorMessage.includes(
        "Missing credentials"
      ) ||

      errorMessage.includes(
        "Incorrect username"
      ) ||

      errorMessage.includes(
        "Incorrect password"
      )
    ) {

      return (
        "Incorrect username or password"
      );
    }

    return errorMessage;
  });

  res.locals.success =
    req.flash("success");

  res.locals.error =
    errors;

  res.locals.currUser =
    req.user || null;

  res.locals.requestPath =
    req.path;

  res.locals.searchQuery =
    req.query.query || "";

  // IMPORTANT FIX
  if (req.session.redirectUrl) {

    res.locals.redirectUrl =
      req.session.redirectUrl;
  }

  next();
});


// Google Routes
app.get(

  "/auth/google",

  passport.authenticate(
    "google",
    {
      scope: ["profile", "email"],
    }
  )
);

app.get(

  "/auth/google/callback",

  passport.authenticate(
    "google",
    {
      failureRedirect: "/login",
      failureFlash: true,
    }
  ),

  (req, res) => {

    req.flash(
      "success",
      "Welcome To Wanderlust!"
    );

    const redirectUrl =
      req.session.redirectUrl ||
      "/listings";

    delete req.session.redirectUrl;

    res.redirect(redirectUrl);
  }
);


// App Routes
app.use(
  "/listings",
  listingRouter
);

app.use(
  "/listings/:id/reviews",
  reviewsRouter
);

app.use(
  "/wishlists",
  wishlistRouter
);

app.use(
  "/",
  userRouter
);


// Stripe Protected Route
app.post(

  "/create-checkout-session/:id",

  isLoggedIn,

  async (req, res, next) => {

    try {

      const listing =
        await Listing.findById(
          req.params.id
        );

      if (!listing) {

        throw new ExpressError(
          404,
          "Listing not found!"
        );
      }

      const checkoutSession =
        await stripe.checkout.sessions.create({

          payment_method_types: [
            "card",
          ],

          line_items: [
            {
              price_data: {

                currency: "inr",

                product_data: {
                  name:
                    listing.title,
                },

                unit_amount:
                  listing.price * 100,
              },

              quantity: 1,
            },
          ],

          mode: "payment",

          success_url:
            `${process.env.BASE_URL}/listings`,

          cancel_url:
            `${process.env.BASE_URL}/listings`,
        });

      res.redirect(
        303,
        checkoutSession.url
      );

    } catch (err) {

      next(err);
    }
  }
);


// Static Pages

app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("terms.ejs");
});

app.get("/", (req, res) => {
  res.redirect("/listings");
});


// Request Logger
app.use((req, res, next) => {

  console.log(
    "Requested URL:",
    req.originalUrl
  );

  next();
});


// Ignore Favicon Requests

app.get("/favicon.ico", (req, res) => {

  res.status(204).end();

});

// 404
app.all("*", (req, res, next) => {

  next(
    new ExpressError(
      404,
      "Page not found!"
    )
  );
});


// Error Handler
app.use(
  (err, req, res, next) => {

    if (res.headersSent) {
      return next(err);
    }

    console.log(err);

    const {
      statusCode = 500,
      message =
        "Something went wrong!",
    } = err;

    res.status(statusCode);

    res.render(
      "error.ejs",
      { message }
    );
  }
);


// Server
const PORT =
  process.env.PORT || 8080;

app.listen(PORT, () => {

  console.log(
    `Server Running On Port ${PORT}`
  );
});