const Listing = require("../models/listing.js");
const fetch = require("node-fetch");

const defaultImage = {
  url: "/default.jpg",
  filename: "defaultlistingimage",
};


// Index Route
module.exports.index = async (req, res, next) => {
  try {
    const listings = await Listing.find({});
    res.render("listings/index", { listings });
  } catch (err) {
    console.log("INDEX ERROR:", err);
    next(err);
  }
};


// New Form Route
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};


// Show Route
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    console.log("SHOW ERROR:", err);
    next(err);
  }
};


// Create Route
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);

    if (req.files && req.files.length > 0) {
      newListing.images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));
    } else {
      newListing.images = [defaultImage];
    }


    // Dynamic Geocoding
    const searchText = `${newListing.location}, ${newListing.country}`;
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "WanderLust-App",
        },
      }
    );

    const geoData = await geoResponse.json();

    if (geoData.length > 0) {
      const latitude = parseFloat(geoData[0].lat);
      const longitude = parseFloat(geoData[0].lon);
      newListing.geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    console.log("CREATE ERROR:", err);
    next(err);
  }
};


// Edit Form Route
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  } catch (err) {
    console.log("EDIT FORM ERROR:", err);
    next(err);
  }
};


// Update Route
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;

    if (req.files && req.files.length > 0) {
      listing.images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));
    }


    // Update Coordinates
    const searchText = `${listing.location}, ${listing.country}`;
    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "WanderLust-App",
        },
      }
    );

    const geoData = await geoResponse.json();

    if (geoData.length > 0) {
      const latitude = parseFloat(geoData[0].lat);
      const longitude = parseFloat(geoData[0].lon);
      listing.geometry = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    next(err);
  }
};


// Delete Route
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
  } catch (err) {
    console.log("DELETE ERROR:", err);
    next(err);
  }
};