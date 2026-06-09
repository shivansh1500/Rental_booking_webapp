const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const {validateListing, isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controlleers/listings.js");
const multer = require("multer")
const {storage, cloudinary} = require("../cloudConfig.js");
const upload = multer({storage})

// // Index route & Create route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,

        upload.single("listing[image]"),
        
        validateListing, 
        wrapAsync(listingController.createListing)
    );

router.get("/search", listingController.search);

// // New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// // Show route & Update route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 

        upload.single("listing[image]"),
        validateListing, 
        wrapAsync(listingController.updateListing)
    );

// // Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// // Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

module.exports = router;
