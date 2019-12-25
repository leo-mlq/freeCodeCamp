"use strict";

var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");

var app = express();
var router = express.Router();
var mongo = require("mongodb");
var mongoose = require("mongoose");
var db = require("./database.js");

// Basic Configuration
var port = process.env.PORT || 2333;

app.use(cors());
var enableCORS = function(req, res, next) {
  if (!process.env.DISABLE_XORIGIN) {
    var allowedOrigins = [
      "https://marsh-glazer.gomix.me",
      "https://narrow-plane.gomix.me",
      "https://www.freecodecamp.com"
    ];
    var origin = req.headers.origin;
    if (!process.env.XORIGIN_RESTRICT || allowedOrigins.indexOf(origin) > -1) {
      console.log(req.method);
      res.set({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept"
      });
    }
  }
  next();
};

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use("/_api", enableCORS, router);

const checkURL = require("./helper.js").checkURL;
const lookUp = require("./helper.js").lookUp;

var createUrl = db.createAndSaveUrl;
var findUrl = db.findOneUrl;
var findSUrl = db.findOneSUrl;

app.post("/api/shorturl/new", function(req, res, next) {
  checkURL(req.body.url, (err, trimmedURL) => {
    if (err) next(err);
    if (!trimmedURL) return res.json({ error: "invalid URL" });
    else {
      lookUp(trimmedURL, function(err, data) {
        if (err) return next(err);
        if (!data) return res.json({ error: "invalid Hostname" });
        findUrl(req.body.url, (err, data) => {
          if (err) next(err);
          if (data)
            return res.json({
              original_url: req.body.url,
              short_url: data.shortenedUrl
            });
          else {
            createUrl(req.body.url, (err, data) => {
              if (err) next(err);
              if (!data) next({ message: "Missing callback argument" });
              return res.json({
                original_url: req.body.url,
                short_url: data.shortenedUrl
              });
            });
          }
        });
      });
    }
  });
});

app.get("/api/shorturl/:user_surl", (req, res, next) => {
  findSUrl(req.params.user_surl, (err, data) => {
    if (err) next(err);
    if (!data) return res.json({ error: "invalid URL" });
    res.redirect(data.originalUrl);
  });
});

app.use(function(req, res) {
  if (req.method.toLowerCase() === "options") {
    res.end();
  } else {
    res
      .status(404)
      .type("txt")
      .send("Not Found");
  }
});

var listener = app.listen(process.env.PORT || 3000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
