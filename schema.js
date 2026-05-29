const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    country: joi.string().required(),

    category: joi.string().valid(
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
      "Containers"
    ).required(),

    isTrending: joi.boolean(),
    price: joi.number().required().min(0),

    images: joi.array().items(
      joi.object({
        url: joi.string().allow("", null),
        filename: joi.string().allow("", null),
      })
    ).optional(),
  }).required(),
});

module.exports.reviewSchema = joi.object({
  review: joi.object({
    rating: joi.number().required().min(1).max(5),
    comment: joi.string().required(),
  }).required(),
});