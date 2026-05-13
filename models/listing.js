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
      "Trending",
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
    default: "Trending",
    required: true,
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
        default: "defaultlistingimage",
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
      default: [76.6141, 8.8932],
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

  country: {
    type: String,
  },

  // Reviews
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  // Owner
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;