const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const listingSchema = new Schema({

  // Title
  title: {
    type: String,
    required: true,
  },

  // Description
  description: {
    type: String,
  },

  // Category
  category: {

    type: String,

    enum: [

      "Rooms",

      "Iconic Cities",

      "Mountains",

      "Castles",

      "Amazing Pools",

      "Camping",

      "Farms",

      "Arctic",

      "Domes",

      "Boats",

      "Containers",

    ],

    default: "Rooms",

    required: true,
  },


  // REAL TRENDING SYSTEM
  isTrending: {

    type: Boolean,

    default: false,
  },


  // Images
  images: [

    {

      url: {

        type: String,

        default: "/default.jpg",
      },

      filename: {

        type: String,

        default:
          "defaultlistingimage",
      },
    },
  ],


  // Geometry For Leaflet Map
  geometry: {

    type: {

      type: String,

      enum: ["Point"],

      default: "Point",
    },

    coordinates: {

      type: [Number],

      default: undefined,
    },
  },


  // Price
  price: {
    type: Number,
  },


  // Location
  location: {
    type: String,
  },


  // Country
  country: {
    type: String,
  },


  // Reviews
  reviews: [

    {

      type:
        Schema.Types.ObjectId,

      ref: "Review",
    },
  ],


  // Owner
  owner: {

    type:
      Schema.Types.ObjectId,

    ref: "User",
  },

});


const Listing = mongoose.model(
  "Listing",
  listingSchema
);

module.exports = Listing;