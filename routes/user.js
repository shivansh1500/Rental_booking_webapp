const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controlleers/users.js");

// // user get & post signnup route 
router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// // user get & post login route
router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(
    saveRedirectUrl,
    passport.authenticate("local", {failureRedirect : "/login", failureFlash : true}), 
    userController.login
    );

// // user logout route
router.get("/logout", userController.logout);

module.exports = router