var mongo = require("mongodb");
var mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortenedUrl: String
});

let urlModel = mongoose.model("url", urlSchema);

var findOneUrl = function(_url, done) {
  urlModel.findOne({ originalUrl: _url }, (err, data) => {
    return err ? done(err) : done(null, data);
  });
};

var findOneSUrl = function(_url, done) {
  urlModel.findOne({ shortenedUrl: _url }, (err, data) => {
    return err ? done(err) : done(null, data);
  });
};

var createAndSaveUrl = function(_url, done) {
  let coll = mongoose.connection.db.collection("urls");
  coll.countDocuments((err, data) => {
    if (err) return done(null);
    var newUrl = new urlModel({
      originalUrl: _url,
      shortenedUrl: data
    });
    newUrl.save((err, data) => {
      return err ? done(err) : done(null, data);
    });
  });
};

exports.urlModel = urlModel;
exports.createAndSaveUrl = createAndSaveUrl;
exports.findOneUrl = findOneUrl;
exports.findOneSUrl = findOneSUrl;
