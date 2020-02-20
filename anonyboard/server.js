"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var expect = require("chai").expect;
var cors = require("cors");
var helmet = require("helmet");

var apiRoutes = require("./routes/api.js");
var fccTestingRoutes = require("./routes/fcctesting.js");
var runner = require("./test-runner");

var mongo = require("./utils/database.js");

var app = express();

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//helmet
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.referrerPolicy({ policy: "same-origin" }));

//root level middleware
app.use(function middleware(req, res, next) {
  // Do something
  // Call the next function in line:
  var string = req.method + " " + req.path + " - " + req.ip;
  console.log(string);
  next();
});

//Sample front-end
app.route("/b/:board/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/board.html");
});
app.route("/b/:board/:threadid").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/thread.html");
});

//Index page (static HTML)
app.route("/").get(function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
const router = async () => {
  var db = await mongo.getDB("test");
  await apiRoutes(app, db);
  //await mongo.disconnect();

  app.use(function(req, res, next) {
    res
      .status(404)
      .type("text")
      .send("Not Found");
  });

  // Error Middleware
  app.use(function(err, req, res, next) {
    if (err) {
      res
        .status(err.status || 500)
        .type("txt")
        .send(err.message || "SERVER ERROR");
    }
  });

  //Start our server and tests!
  app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port " + process.env.PORT);
    if (process.env.NODE_ENV === "test") {
      console.log("Running Tests...");
      setTimeout(function() {
        try {
          runner.run();
        } catch (e) {
          var error = e;
          console.log("Tests are not valid:");
          console.log(error);
        }
      }, 1500);
    }
  });
};

router();

module.exports = app; //for testing
