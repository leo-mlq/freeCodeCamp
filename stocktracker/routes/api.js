/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var mongo = require("mongodb");
var mongoose = require("mongoose");
var rp = require("request-promise");
var Promise = require("promise");

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

const stockSchema = new mongoose.Schema({
  name: String,
  ip: [String],
  hookEnabled: {
    type: Boolean,
    required: false,
    default: true
  }
});

// stockSchema.pre("save", next => {
//   if (!this.hookEnabled) {
//     return next();
//   }
// });

var stockModel = new mongoose.model("stocks", stockSchema);

function getStock(stocks, like, ip, res) {
  return new Promise((resolve, reject) => {
    stocks = stocks.toUpperCase();
    var url = proxy_url.replace("GOOG", stocks);
    var options = {
      uri: url,
      headers: {
        "User-Agent": "Request-Promise"
      },
      json: true
    };

    stockModel.findOne({ name: stocks }, (err, ret) => {
      if (err) throw err;
      if (!ret) {
        var tmpObj = { name: stocks, ip: [] };
        if (like) tmpObj.ip.push(ip);
        var stockObj = new stockModel(tmpObj);
        rp(options)
          .then(stockProxyObj => {
            var retObj = {
              stock: stocks,
              price: stockProxyObj.latestPrice,
              likes: tmpObj.ip.length
            };
            stockObj.save(err => {
              resolve(retObj);
            });
          })
          .catch(err => {
            if (err) {
              res.send("invalid stock symbol");
              reject(err);
            }
          });
      } else {
        rp(options)
          .then(stockProxyObj => {
            var retObj = {
              stock: ret.name,
              price: stockProxyObj.latestPrice,
              likes: ret.ip.length
            };
            if (like) {
              ipExists(ret.ip, ip).then(bool => {
                if (!bool) {
                  ret.ip.push(ip);
                  ret.save((err, updatedRet) => {
                    if (err) throw err;
                    retObj.likes = updatedRet.ip.length;
                    resolve(retObj);
                  });
                }
              });
            } else {
              resolve(retObj);
            }
          })
          .catch(err => {
            if (err) res.send("invalid stock symbol");
            reject(err);
          });
      }
    });
  });
}

function isString(value) {
  return typeof value === "string" || value instanceof String;
}

/*async function to determine if one like per ip*/
async function ipExists(arr, ip) {
  const filteredArr = await Promise.all(
    arr.map(ipFromArr => ipFromArr === ip).filter(Boolean)
  );
  return filteredArr.length == 1;
}

var proxy_url = "https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote";

module.exports = function(app) {
  app.route("/api/stock-prices").get(function(req, res) {
    var stocks = req.query.stock;
    var like = req.query.like ? true : false;
    var ip = (
      req.headers["x-forwarded-for"] || req.connection.remoteAddress
    ).split(",")[0];
    //console.log(`[${stocks}], ${like}, ${ip}`);

    /*one stock*/
    if (isString(stocks)) {
      var getStockPromise = getStock(stocks, like, ip, res);
      getStockPromise.then(
        result => {
          return res.json(result);
        },
        err => {
          throw err;
        }
      );
    } else {
      Promise.all(stocks.map(stock => getStock(stock, like, ip, res))).then(
        result => {
          var stockOne=result[0];
          var stockTwo=result[1];
          var stockOneLike=parseInt(result[0].likes);
          var stockTwoLike=parseInt(result[1].likes);
          
          delete stockOne.likes;
          delete stockTwo.likes;
          
          var diffLikes=Math.abs(stockOneLike-stockTwoLike);
          if(stockOneLike>stockTwoLike){
            stockOne.rel_likes=diffLikes;
            stockTwo.rel_likes=-diffLikes;
          }
          else if(stockOneLike===stockTwoLike){
            stockOne.rel_likes=0;
            stockTwo.rel_likes=0;
          }
          else{
            stockOne.rel_likes=-diffLikes;
            stockTwo.rel_likes=diffLikes;            
          }
          res.json({
            stockData:[stockOne, stockTwo]
          })
          
        },
        err => {
          throw err;
        }
      );
    }
  });
};
