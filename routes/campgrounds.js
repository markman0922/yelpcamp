var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  mapsApi: process.env.MAPS_API_KEY,
  placeApi: process.env.PLACE_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX - show all campgrounds
router.get("/", function(req, res){
    // get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds, page: 'campgrounds', currentUser: req.user});
        }
    });
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   geocoder.geocode(req.body.location, function (err, data){
       if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
       }
       var lat = data[0].latitude;
       var lng = data[0].longitude;
       var location = data[0].formattedAddress;
 
       var newCampground = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
       // Create a new campground and save to DB
       Campground.create(newCampground, function(err, newlyCreated){
           if(err){
               console.log(err);
           } else {
             // redirect back to campgrounds page
                res.redirect("/campgrounds");
           }
        });
    }); 
});
  
// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
     geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// Destroy campground router
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }

    
    });
});


module.exports = router;