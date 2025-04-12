const User = require("../models/users");


// Render Signup Form
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup");
};

// Signup Logic
module.exports.signup = async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({username, email});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};


// Render Login Form
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login")
};


// Login Logic
module.exports.login = async(req, res) => {
    req.flash("success", "welcome back to wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};


// Logout Logic
module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "you logged out!");
        res.redirect("/listings");
    })
};