const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({

  // Username
  username: {
    type: String,
    required: true,
    unique: true,
  },

  // Email
  email: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Google Auth
  googleId: String,
  displayName: String,
  photo: String,
  
  // Wishlist
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});


userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;