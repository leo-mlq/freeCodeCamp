// server.js
// where your node app starts
"use strict";

// init project
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*debug middleware start*/
if (process.env.ENABLE_DEBUGGING == "true") {
  let count = 0;
  app.use((req, res, next) => {
    count++;
    let str = count + " " + req.method + " " + req.url;
    console.log("\nNew request:\n" + str);
    console.log(req.body);
    res.on("finish", () => console.log("\nRequest ended:\n" + str));
    next();
  });
}

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

/*end*/
app.get("/api/timestamp/:date_string?", (req, res, next) => {
  let inDateString = req.params.date_string;
  console.log(inDateString);
  let date;

  var regexTest = /^\s+$/;
  if (inDateString === undefined) {
    date = new Date();
    res.json({
      unix: date.getTime(),
      utc: date.toUTCString()
    });
  } else if (regexTest.test(inDateString)) {
    date = new Date("1970-01-01");
    res.json({
      unix: 0,
      utc: date.toUTCString()
    });
  } else {
    date = new Date(inDateString);
    console.log(date);
    if (date === "Invalid Date") {
      res.json({
        error: "Invalid Date"
      });
    } else {
      res.json({
        unix: date.getTime(),
        utc: date.toUTCString()
      });
    }
  }
});

app.use((req, res, next) => {
  res
    .status(404)
    .type("text")
    .send("Not Found");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
