if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require("./utils/ExrpressError.js");
const session = require("express-session");

const MongoStore = require("connect-mongo");

const flash = require("connect-flash");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("Connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))

app.use(express.urlencoded({extended : true}))

app.use(methodOverride("_method"))

app.engine("ejs", ejsMate)

app.use(express.static(path.join(__dirname, "/public")))


// // home route
app.get("/", (req, res) => {
    res.redirect("/listings");
})

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600
})

store.on("error", () => {
    console.log("Error in Mongo Session Store");
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true
    }
}

// // implement session & flash as middleware
app.use(session(sessionOptions));
app.use(flash());

// // configurations for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
})


// // add routes of listings & reviews & user as middleware
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// // to handle all types of request at all types of route
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"))
})

// // error handller
app.use((err, req, res, next) => {
    
    let {StatusCode = 500, message = "Something went wrong"} = err;

    res.status(StatusCode).render("error.ejs", { message })
})

const port = 8080;

app.listen(port, () => {
  console.log(`App is listening at port ${port}`);
});
