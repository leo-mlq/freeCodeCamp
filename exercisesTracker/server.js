const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var async = require("async");
const cors = require("cors");
const db = require("./database.js");

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*root level middleware*/
app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res, next) => {
  if (!req.body.username) return res.send(`Path 'username' is required.`);
  db.createAndSaveUser(req.body.username, (err, data) => {
    if (err) return next(err);
    //console.log(data);
    if (!data) return res.send("username already taken");
    else res.json({ username: req.body.username, _id: data });
  });
});

app.post("/api/exercise/add", (req, res, next) => {
  var activity = {};
  if (!req.body.description)
    return res.send(`Path \`description\` is required.`);
  if (!req.body.duration) return res.send(`Path 'duration' is required.`);
  activity["description"] = req.body.description;
  activity["duration"] = req.body.duration;

  var tmpDate;
  tmpDate = req.body.date ? new Date(req.body.date) : new Date();
  activity["date"] = tmpDate
    .toUTCString()
    .match(/^(\w{3}),\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0];

  db.findAndUpdate(req.body.userId, activity, (err, data) => {
    if (err) return next(err);
    res.send(data);
  });
});

app.get("/api/exercise/users", (req, res, next) => {
  db.findAllUsers((err, data) => {
    if (err) next(err);
    res.send(data);
  });
});

app.get("/api/exercise/log", (req, res, next) => {
  var userId = req.query.userId;
  var from = req.query.from == "" ? undefined : req.query.from;
  var to = req.query.to === "" ? undefined : req.query.to;
  var limit = req.query.limit === "" ? undefined : req.query.limit;

  //(err data) corresponds to done()->calling done(null, data)
  db.findOneUser(req.query.userId, (err, data) => {
    if (err) return next(err);
    var ret = data;
    var tmpLog = data.log;
    var retLog;
    if (from && to) {
      ret["from"] = new Date(from)
        .toUTCString()
        .match(/^(\w{3}),\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0];
      ret["to"] = new Date(to)
        .toUTCString()
        .match(/^(\w{3}),\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0];
      async.filter(
        tmpLog,
        (curLog, callback) => {
          //next(null, new Date(curLog.date) >= new Date(from));
          callback(
            null,
            new Date(curLog.date) >= new Date(from) &&
              new Date(to) >= new Date(curLog.date)
          );
        },
        (err, results) => {
          retLog = results;
        }
      );
    } else if (from) {
      ret["from"] = new Date(from)
        .toUTCString()
        .match(/^(\w{3}),\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0];

      async.filter(
        tmpLog,
        (curLog, callback) => {
          //next(null, new Date(curLog.date) >= new Date(from));
          callback(null, new Date(curLog.date) >= new Date(from));
        },
        (err, results) => {
          retLog = results;
        }
      );
    } else if (to) {
      ret["to"] = new Date(to)
        .toUTCString()
        .match(/^(\w{3}),\s(\d{2}\s(\w{3})\s(\d{4}))/gi)[0];
      async.filter(
        tmpLog,
        (curLog, callback) => {
          //next(null, new Date(curLog.date) >= new Date(from));
          callback(null, new Date(curLog.date) <= new Date(to));
        },
        (err, results) => {
          retLog = results;
        }
      );
    }

    if (limit && !isNaN(limit) && tmpLog.length >= parseInt(limit, 10)) {
      retLog = retLog.slice(0, limit);
    }
    ret["count"] = retLog.length;
    ret["log"] = retLog;

    res.send(ret);
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
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
