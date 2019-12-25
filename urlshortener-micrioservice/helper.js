const dns = require("dns");

const checkURL = (_url, done) => {
  var regexp = /^((https|http):\/\/)(www\.)(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  var ret = regexp.test(_url);
  if (!ret) return done(null, null);
  done(null, _url.replace(/^(https|http):\/\/(www\.)/, ""));
};
// done(use in middleware function) and next(to connect middlewares) are different
// done(address) acts as output to res,  and done(null, address) acts as output to the middleware itself,  are different
const lookUp = (_url, done) => {
  dns.lookup(_url, (err, address, family) => {
    if (err) return done(null, null);
    //console.log("address: %j family: IPv%s", address, family);
    done(null, address);
  });
};

exports.checkURL = checkURL;
exports.lookUp = lookUp;
