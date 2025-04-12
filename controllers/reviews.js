const Review = require("../models/review");
const Listing = require("../models/listing");

// CREATE - Post a new review
module.exports.reviewPostRoute = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview); 
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved!");
    req.flash("success", "New review created");
    res.redirect(`/listings/${listing._id}`);
};


// DELETE - Delete a review
module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted");
    res.redirect(`/listings/${id}`);
};