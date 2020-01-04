"use strict";

var express = require("express");
var cors = require("cors");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// require and use "multer"...
var crypto = require("crypto");
var GridFsStorage = require("multer-gridfs-storage");
var multer = require("multer");
//var shortid = require("shortid");
var ObjectID = require("object-id");

var app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*root level middleware*/
app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/hello", function(req, res) {
  res.json({ greetings: "Hello, API" });
});

/*file upload api*/

const conn = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
  console.log("Connection Successful");
  // passing the db to the bucket, bucket name will be used as name of a collection.
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename =
          file.originalname +
          new Date()
            .toUTCString()
            .match(/\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0]
            .replace(/\s/g, "_");
        const fileInfo = {
          filename: filename,
          bucketName: "uploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage: storage,
  putSingleFilesInArray: true
});
app.post("/api/fileanalyse", upload.array("upfile", 12), async (req, res) => {
  var ret = req.files.map(data => ({
    name: data.filename,
    type: data.contentType,
    size: data.size
  }));
  res.json(ret);
});

app.post("/api/getfile", (req, res, next) => {
  var file = gfs.find({ filename: req.body.filename }).toArray((err, data) => {
    if (err) next(err);
    console.log(data);
    if (!data || data.length === 0)
      return res
        .status(404)
        .type("txt")
        .send("file does not exist");
    gfs.openDownloadStreamByName(req.body.filename).pipe(res);
  });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
