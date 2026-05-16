const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const defaultImage = {
  url: "/default.jpg",
  filename: "defaultlistingimage",
};

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: "6a01c9006afcef1b50b3f1ff",
    images: obj.images && obj.images.length > 0 ? obj.images : [defaultImage],
  }));

  await Listing.insertMany(updatedData);

  console.log("Data Was Initialized");
};

main()
  .then(() => {
    console.log("Connected To DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });