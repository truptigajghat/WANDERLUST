if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const expressError = require("./utils/expressError");
const {listingSchema, reviewSchema} = require("./schema");
const Review = require("./models/review");
const listingsRoutes = require("./routes/listings");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");




const dbUrl = process.env.ATLASDB_URL;

main() 
.then(()=> {
    console.log("connected to db");
}).catch((err) => {
    console.log(err);
});
async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.engine("ejs", ejsMate);


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("error in mongo session store", err);
});

const sessionOption = {
    store,
    secret:  process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,   
    }
};





app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currentRoute = req.path;

    next();
});

// app.get("/demouser", async(req, res) => {
//     let fakeUser = new User({
//         email: "hey@gmail.com",
//         username: "trupti18",
//     });
//     let registeredUser = await User.register(fakeUser, "heytruni18");
//     res.send(registeredUser);
// });

app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", usersRoutes);




const validateListing = (req,res, next) =>{
    console.log("Request Body:", req.body); // Log request data
     let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    }else{
        next();
    }
};

const validateReview = (req,res, next) =>{
    console.log("Request Body:", req.body); // Log request data
    let { error } = reviewSchema.validate({ review: req.body.review });

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new expressError(400, errMsg);
    }else{
        next();
    }
};


app.all("*", (req, res, next) => {
    next(new expressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {

    const {status = 500, message = "something went wrong"} = err;
    res.status(status).render("error", {message});
 
});

app.listen(8080,() => {
    console.log(`server listening on port 8080`);
});