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

    res.render("listings/index", {
      listings,
      selectedCategory: null,
      searchQuery: "",
    });
  } catch (err) {
    console.log("Index Error:", err);
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
      req.flash("error", "Listing You Requested Does Not Exist!");
      return res.redirect("/listings");
    }

    res.render("listings/show", { listing });
  } catch (err) {
    console.log("Show Error:", err);
    next(err);
  }
};


// Geocoding Helper
async function geocodeListing(location, country) {
  const searchText = `${location}, ${country}`;

  console.log("Search:", searchText);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const geoResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "WanderLust-App" },
      }
    );

    clearTimeout(timeout);

    const geoData = await geoResponse.json();

    console.log("Geodata:", geoData);

    if (geoData && geoData.length > 0) {
      const latitude = parseFloat(geoData[0].lat);
      const longitude = parseFloat(geoData[0].lon);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        return {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      }
    }
  } catch (geoErr) {
    console.log("Geocoding Error:", geoErr.message);
  }

  return null;
}


// Create Route
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);

    // Trending System
    newListing.isTrending = req.body.listing.isTrending === "true";

    // Image Handling
    newListing.images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        newListing.images.push({
          url: file.path,
          filename: file.filename,
        });
      });
    }

    if (newListing.images.length === 0) {
      newListing.images.push(defaultImage);
    }

    // Geocoding
    const geometry = await geocodeListing(newListing.location, newListing.country);
    if (geometry) {
      newListing.geometry = geometry;
    }

    // Owner
    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.log("Create Error:", err);
    next(err);
  }
};


// Edit Form Route
module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing Does Not Exist!");
      return res.redirect("/listings");
    }

    res.render("listings/edit", { listing });
  } catch (err) {
    console.log("Edit Form Error:", err);
    next(err);
  }
};


// Update Route
module.exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing Not Found!");
      return res.redirect("/listings");
    }

    // Update Fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.country = req.body.listing.country;
    listing.location = req.body.listing.location;
    listing.category = req.body.listing.category;

    // Trending System
    listing.isTrending = req.body.listing.isTrending === "true";

    // Update Images
    if (req.files && req.files.length > 0) {
      listing.images = [];

      req.files.forEach((file) => {
        listing.images.push({
          url: file.path,
          filename: file.filename,
        });
      });
    }

    // Geocoding
    const geometry = await geocodeListing(listing.location, listing.country);
    if (geometry) {
      listing.geometry = geometry;
    }

    await listing.save();

    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Update Error:", err);
    next(err);
  }
};


// Delete Route
module.exports.destroyListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      req.flash("error", "Listing Not Found!");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted Successfully!");
    res.redirect("/listings");
  } catch (err) {
    console.log("Delete Error:", err);
    next(err);
  }
};