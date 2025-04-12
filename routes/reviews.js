const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const expressError = require("../utils/expressError");
const {listingSchema, reviewSchema} = require("../schema");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { isLoggedIn, isReviewOwner, validateReview } = require("../middleware");
const User = require("../models/users");
const reviewConntroller = require("../controllers/reviews");



// review post route
router.post("/", isLoggedIn, validateReview,  wrapAsync(reviewConntroller.reviewPostRoute));

//delete review route
router.delete("/:reviewId",isLoggedIn, isReviewOwner, wrapAsync(reviewConntroller.destroyReview));

module.exports = router;