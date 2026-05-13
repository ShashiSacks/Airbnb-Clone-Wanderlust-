const cloudinary =
  require("cloudinary").v2;

const {
  CloudinaryStorage,
} = require(
  "multer-storage-cloudinary"
);


// Cloudinary Config

cloudinary.config({

  cloud_name:
    process.env.CLOUD_NAME,

  api_key:
    process.env.CLOUD_API_KEY,

  api_secret:
    process.env.CLOUD_API_SECRET,

});


// Storage Config

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: {

      folder:
        "Wanderlust_DEV",

      allowedFormats: [
        "png",
        "jpg",
        "jpeg",
        "webp",
      ],

    },

  });


module.exports = {

  cloudinary,

  storage,

};