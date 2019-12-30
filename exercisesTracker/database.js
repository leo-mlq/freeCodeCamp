var mongo = require("mongodb");
var async = require("async");
var Promise = require("promise");
const mongoose = require("mongoose");
const shortid = require("shortid");

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, db) => {
    if (err) {
      console.log("Database error: " + err);
    } else {
      console.log("Successful database connection");
    }
  }
);

const logSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  _id: false
});
4;
const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: shortid.generate
  },
  username: String,
  activityLog: [logSchema],
  versionKey: 0
});

let userModel = mongoose.model("users", userSchema);

var findUserByName = function(_username, done) {
  userModel.findOne({ username: _username }, (err, data) => {
    return err ? done(err) : done(null, data);
  });
};

var createAndSaveUser = function(_username, done) {
  findUserByName(_username, (err, data) => {
    if (err) return done(err);
    if (data) return done(null, false);
    else {
      var tmpID = shortid.generate();
      let user = new userModel({
        username: _username,
        _id: tmpID
        //activityLog: [{ description: "asd" }]
      });
      //console.log(user.activityLog);
      user.save();
      setTimeout(() => done(null, tmpID), 1000);
    }
  });
};

var findAndUpdate = function(_personid, _activity, done) {
  userModel.findById(_personid, (err, data) => {
    if (err) return done(err);
    if (!data) return done(null, "unknown _id");
    data.activityLog.push(_activity);
    //console.log(new Date(_activity.date));
    data.save();
    done(null, {
      username: data.username,
      description: _activity.description,
      duration: _activity.duration,
      _id: _personid,
      date: _activity.date
    });
  });
};

/* handle async using async package*/
// var findAllUsers = done => {
//   userModel.find({}).exec((err, users) => {
//     async.mapLimit(
//       users,
//       5,
//       (user, callback) => {
//         /*(err, result)->calback function*/
//         var ret = { _id: user.id, username: user.username, __v: user.__v };
//         callback(null, ret);
//       },
//       (err, result) => {
//         if (err) done(err);
//         done(null, result);
//       }
//     );
//   });
// };

/*handle using promise*/
var fn = function asyncGetUsers(user) {
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ _id: user.id, username: user.username, __v: user.__v }),
      100
    )
  );
};
// var findAllUsers = done => {
//   userModel.find({}, (err, users) => {
//     if (err) done(err);
//     var actions = users.map(fn);
//     var results = Promise.all(actions);
//     //results.then(console.log);
//     results.then(data => done(null, data));
//   });
// };
/*promise nesting using then*/
var findAllUsers = done => {
  userModel.find({}, (err, users) => {
    if (err) done(err);
    Promise.all(users.map(fn)).then(data => done(null, data));
  });
};

var findOneUser = (_userId, done) => {
  userModel.findOne({ _id: _userId }, (err, data) => {
    if (err) done(err);
    done(null, {
      _id: data._id,
      username: data.username,
      count: data.activityLog.length,
      log: data.activityLog
    });
  });
};
exports.userModel = userModel;
exports.findUserByName = findUserByName;
exports.createAndSaveUser = createAndSaveUser;
exports.findAndUpdate = findAndUpdate;
exports.findAllUsers = findAllUsers;
exports.findOneUser = findOneUser;
