require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOveride = require("method-override"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds");
    
// requiring routes
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");
// seed the database 
// seedDB();    
// mongoose.connect("mongodb://localhost/yelp_camp");
mongoose.connect("mongodb://<mark>:<mem1994>@ds213199.mlab.com:13199/yelpcamp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOveride("_method"));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(flash());

app.locals.moment = require("moment");
// passport config
app.use(require("express-session")({
    secret: "I am almost done with this course.. Off to SQL!",
    resave: false,
    saveUninitialized: false
    
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");

   next();
});

app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The yelp camp has started");
});