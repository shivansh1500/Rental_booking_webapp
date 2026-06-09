const Listing = require("../models/listing.js");

// // index route callback
module.exports.index = async(req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
}

// // new route callback
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
}

// // show route callback
module.exports.showListing = async(req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id).

    populate({path : "reviews", populate : {path : "author"}}).
    populate("owner");
    
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist")
        res.redirect("/listings")
    }

    res.render("listings/show.ejs", { listing })
}

// // create route callback
module.exports.createListing = async(req, res, next) => {
    
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing)

    newListing.owner = req.user._id;

    newListing.image = {url, filename};

    await newListing.save();

    req.flash("success", "New Listing Created!");
    
    res.redirect("/listings")
}

// // edit route callback
module.exports.renderEditForm = async(req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id)

    if(!listing) {
        req.flash("error", "Listing you requested for does not exist")
        res.redirect("/listings")
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_100,w_250/e_blur:60");
    
    res.render("listings/edit.ejs", { listing, originalImageUrl })
}

// // update route callback
module.exports.updateListing = async(req, res) => {

    let { id } = req.params;
    
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success", "Listing Updated!");

    res.redirect(`/listings/${id}`)
}

// Search Route CallBack
module.exports.search = async (req, res) => {

  let input = req.query.q.trim().replace(/\s+/g, " ");

  if (input == "" || input == " " || !input || input == undefined) {
    req.flash("error", "Please enter search query!");
    res.redirect("/listings");
  }

  let data = input.split("");
  let element = "";
  let flag = false;
  for (let index = 0; index < data.length; index++) {
    if (index == 0 || flag) {
      element = element + data[index].toUpperCase();
    } else {
      element = element + data[index].toLowerCase();
    }
    flag = data[index] == " ";
  }

  let allListings = await Listing.find({
    title: { $regex: element, $options: "i" },
  });
  if (allListings.length != 0) {
    res.locals.success = "Listings searched by Title!";
    res.render("listings/index.ejs", { allListings });
    return;
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      category: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Category!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    allListings = await Listing.find({
      country: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Country!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  if (allListings.length == 0) {
    allListings = await Listing.find({
      location: { $regex: element, $options: "i" },
    }).sort({ _id: -1 });
    if (allListings.length != 0) {
      res.locals.success = "Listings searched by Location!";
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }

  const intValue = parseInt(element, 10);
  const intDec = Number.isInteger(intValue);

  if (allListings.length == 0 && intDec) {
    allListings = await Listing.find({ price: { $lte: element } }).sort({
      price: 1,
    });
    if (allListings.length != 0) {
      res.locals.success = `Listings searched by price less than Rs ${element}!`;
      res.render("listings/index.ejs", { allListings });
      return;
    }
  }
  if (allListings.length == 0) {
    req.flash("error", "No listings found based on your search!");
    res.redirect("/listings");
  }
};

// // delete route callback
module.exports.deleteListing = async(req, res) => { 
    let { id } = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");

    res.redirect("/listings")
}
