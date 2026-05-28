const Listing = require("../models/listing.js");
const fetch = require("node-fetch");

const defaultImage = {
  url: "/default.jpg",
  filename: "defaultlistingimage",
};


// =======================================================
// INDEX ROUTE
// =======================================================

module.exports.index = async (
  req,
  res,
  next
) => {

  try {

    const listings =
      await Listing.find({});


    res.render(

      "listings/index",

      {

        listings,

        selectedCategory: null,

        searchQuery: "",

      }
    );

  } catch (err) {

    console.log(
      "INDEX ERROR:",
      err
    );

    next(err);
  }
};


// =======================================================
// NEW FORM ROUTE
// =======================================================

module.exports.renderNewForm = (
  req,
  res
) => {

  res.render(
    "listings/new"
  );
};


// =======================================================
// SHOW ROUTE
// =======================================================

module.exports.showListing = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;


    const listing =
      await Listing.findById(id)

        .populate({

          path: "reviews",

          populate: {
            path: "author",
          },
        })

        .populate("owner");


    if (!listing) {

      req.flash(

        "error",

        "Listing you requested does not exist!"
      );


      return res.redirect(
        "/listings"
      );
    }


    res.render(

      "listings/show",

      { listing }
    );

  } catch (err) {

    console.log(
      "SHOW ERROR:",
      err
    );

    next(err);
  }
};


// =======================================================
// CREATE ROUTE
// =======================================================

module.exports.createListing = async (
  req,
  res,
  next
) => {

  try {

    const newListing =
      new Listing(
        req.body.listing
      );


    // =======================================================
    // REAL TRENDING SYSTEM
    // =======================================================

    newListing.isTrending =
      req.body.listing.isTrending === "true";


    // =======================================================
    // IMAGE HANDLING
    // =======================================================

    newListing.images = [];


    // Uploaded Images

    if (

      req.files &&

      req.files.length > 0
    ) {

      req.files.forEach((file) => {

        newListing.images.push({

          url: file.path,

          filename:
            file.filename,
        });

      });

    }


    // Default Image

    if (
      newListing.images.length === 0
    ) {

      newListing.images.push(
        defaultImage
      );
    }


    // =======================================================
    // GEOCODING
    // =======================================================

    const searchText =
      `${newListing.location}, ${newListing.country}`;


    console.log(
      "SEARCH:",
      searchText
    );


    try {

      const controller =
        new AbortController();


      const timeout =
        setTimeout(() => {

          controller.abort();

        }, 7000);


      const geoResponse =
        await fetch(

          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,

          {

            signal:
              controller.signal,

            headers: {

              "User-Agent":
                "WanderLust-App",
            },
          }
        );


      clearTimeout(timeout);


      const geoData =
        await geoResponse.json();


      console.log(
        "GEODATA:",
        geoData
      );


      if (

        geoData &&

        geoData.length > 0
      ) {

        const latitude =
          parseFloat(
            geoData[0].lat
          );


        const longitude =
          parseFloat(
            geoData[0].lon
          );


        if (

          !isNaN(latitude) &&

          !isNaN(longitude)
        ) {

          newListing.geometry = {

            type: "Point",

            coordinates: [

              longitude,

              latitude,
            ],
          };
        }
      }

    } catch (geoErr) {

      console.log(

        "GEOCODING ERROR:",

        geoErr.message
      );
    }


    // =======================================================
    // OWNER
    // =======================================================

    newListing.owner =
      req.user._id;


    // =======================================================
    // SAVE
    // =======================================================

    await newListing.save();


    req.flash(

      "success",

      "New listing created!"
    );


    res.redirect(
      `/listings/${newListing._id}`
    );

  } catch (err) {

    console.log(
      "CREATE ERROR:",
      err
    );

    next(err);
  }
};


// =======================================================
// EDIT FORM ROUTE
// =======================================================

module.exports.renderEditForm = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;


    const listing =
      await Listing.findById(id);


    if (!listing) {

      req.flash(

        "error",

        "Listing does not exist!"
      );


      return res.redirect(
        "/listings"
      );
    }


    res.render(

      "listings/edit",

      { listing }
    );

  } catch (err) {

    console.log(
      "EDIT FORM ERROR:",
      err
    );

    next(err);
  }
};


// =======================================================
// UPDATE ROUTE
// =======================================================

module.exports.updateListing = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;


    const listing =
      await Listing.findById(id);


    if (!listing) {

      req.flash(

        "error",

        "Listing not found!"
      );


      return res.redirect(
        "/listings"
      );
    }


    // =======================================================
    // UPDATE FIELDS
    // =======================================================

    listing.title =
      req.body.listing.title;


    listing.description =
      req.body.listing.description;


    listing.price =
      req.body.listing.price;


    listing.country =
      req.body.listing.country;


    listing.location =
      req.body.listing.location;


    listing.category =
      req.body.listing.category;


    // =======================================================
    // REAL TRENDING SYSTEM
    // =======================================================

    listing.isTrending =
      req.body.listing.isTrending === "true";


    // =======================================================
    // UPDATE IMAGES
    // =======================================================

    if (

      req.files &&

      req.files.length > 0
    ) {

      listing.images = [];


      req.files.forEach((file) => {

        listing.images.push({

          url: file.path,

          filename:
            file.filename,
        });

      });

    }


    // =======================================================
    // GEOCODING
    // =======================================================

    const searchText =
      `${listing.location}, ${listing.country}`;


    console.log(
      "SEARCH:",
      searchText
    );


    try {

      const controller =
        new AbortController();


      const timeout =
        setTimeout(() => {

          controller.abort();

        }, 7000);


      const geoResponse =
        await fetch(

          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchText)}&format=json&limit=1`,

          {

            signal:
              controller.signal,

            headers: {

              "User-Agent":
                "WanderLust-App",
            },
          }
        );


      clearTimeout(timeout);


      const geoData =
        await geoResponse.json();


      console.log(
        "GEODATA:",
        geoData
      );


      if (

        geoData &&

        geoData.length > 0
      ) {

        const latitude =
          parseFloat(
            geoData[0].lat
          );


        const longitude =
          parseFloat(
            geoData[0].lon
          );


        if (

          !isNaN(latitude) &&

          !isNaN(longitude)
        ) {

          listing.geometry = {

            type: "Point",

            coordinates: [

              longitude,

              latitude,
            ],
          };
        }
      }

    } catch (geoErr) {

      console.log(

        "GEOCODING ERROR:",

        geoErr.message
      );
    }


    // =======================================================
    // SAVE
    // =======================================================

    await listing.save();


    req.flash(

      "success",

      "Listing updated successfully!"
    );


    res.redirect(
      `/listings/${id}`
    );

  } catch (err) {

    console.log(
      "UPDATE ERROR:",
      err
    );

    next(err);
  }
};


// =======================================================
// DELETE ROUTE
// =======================================================

module.exports.destroyListing = async (
  req,
  res,
  next
) => {

  try {

    const { id } =
      req.params;


    const deletedListing =
      await Listing.findByIdAndDelete(id);


    if (!deletedListing) {

      req.flash(

        "error",

        "Listing not found!"
      );


      return res.redirect(
        "/listings"
      );
    }


    req.flash(

      "success",

      "Listing deleted successfully!"
    );


    res.redirect(
      "/listings"
    );

  } catch (err) {

    console.log(
      "DELETE ERROR:",
      err
    );

    next(err);
  }
};