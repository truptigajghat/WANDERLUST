const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema } = require("../schema");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const listingController = require("../controllers/listings");
const multer = require("multer");
const { cloudinary } = require("../cloudConfig");

const storage = multer.memoryStorage(); // save to memory
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res, next) => {
      // Manual upload to Cloudinary
      if (!req.file) {
        return next(new Error("No file uploaded"));
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "wanderlust_Dev" },
        async (error, result) => {
          if (error) return next(error);
          req.body.listing.image = result.secure_url;
          await listingController.createListing(req, res, next);
        }
      );

      stream.end(req.file.buffer);
    })
  );

// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showlistings))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(async (req, res, next) => {
      if (req.file) {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "wanderlust_Dev" },
          async (error, result) => {
            if (error) return next(error);
            req.body.listing.image = result.secure_url;
            await listingController.updateListing(req, res, next);
          }
        );
        stream.end(req.file.buffer);
      } else {
        await listingController.updateListing(req, res, next);
      }
    })
  )
  .delete(isLoggedIn, wrapAsync(listingController.destroyListing));

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditListingForm));

module.exports = router;
