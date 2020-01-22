/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var ObjectId = require("mongodb").ObjectID;
var DBHandler = require("../database/dbHandler.js");
var async = require("async");

module.exports = function(app) {
  var dbHandler = new DBHandler();

  app
    .route("/api/issues/:project")
    .get(function(req, res) {
      var project = req.params.project;
      var {
        open: _isopen,
        assigned_to: _assign,
        created_by: _author
      } = req.query;
      //if (_isopen) console.log("test");

      dbHandler.findAll((err, data) => {
        if (err) throw err;

        async.filter(
          data,
          (issue, cb) => {
            //console.log(String(issue["open"]) === _isopen);
            if (_isopen && _assign)
              return cb(
                null,
                String(issue["open"]) === _isopen &&
                  issue["assigned_to"] === _assign
              );
            else {
              if (_isopen) return cb(null, String(issue["open"]) === _isopen);
              if (_assign) return cb(null, issue["assigned_to"] === _assign);
              else cb(null, true);
            }
          },
          (err, results) => {
            res.json(results);
          }
        );
      });
    })

    .post(function(req, res) {
      var project = req.params.project; //apitest

      var {
        issue_title: _title,
        issue_text: _text,
        created_by: _author,
        assigned_to: _asignee,
        status_text: _status //_status == ""
      } = req.body;
      if (!_title && !_text && !_author)
        return res.send("missing required fields");
      var _date = new Date();
      var _update = _date;
      var _isopen = true;
      dbHandler.createIssue(
        _title,
        _text,
        _author,
        _asignee,
        _status,
        _date,
        _update,
        _isopen,
        (err, data) => {
          if (err) throw err;
          res.json({
            issue_title: _title,
            issue_text: _text,
            created_on: _date,
            updated_on: _update,
            created_by: _author,
            assigned_to: _asignee,
            status_text: _status,
            _id: data
          });
        }
      );
    })

    .put(function(req, res) {
      var project = req.params.project;
      var {
        _id: _id,
        issue_title: _title,
        issue_text: _text,
        created_by: _author,
        assigned_to: _asignee,
        status_text: _status,
        open: _isopen
      } = req.body;
      if (!_id) return res.send("missing id");
      if (!ObjectId.isValid(_id)) {
        return res.send("invalid id");
      }
      if (
        _title == "" &&
        _text == "" &&
        _author == "" &&
        _asignee == "" &&
        _status == "" &&
        _isopen == undefined
      )
        return res.send("no updated field sent");
      var _update = new Date();

      dbHandler.updateIssue(
        _id,
        _title,
        _text,
        _author,
        _asignee,
        _status,
        _update,
        _isopen,
        (err, data) => {
          if (err) console.log(err);
          if (!data) {
            console.log("test");

            return res.send("unknown id");
          }
          return res.status(200).send(data);
        }
      );
    })

    .delete(function(req, res) {
      //var project = req.params.project;
      var _id = req.body._id;
      if (!_id) return res.send("missing id");
      if (!ObjectId.isValid(_id)) {
        return res.send("coule not delete " + _id);
      }
      dbHandler.deleteIssue(_id, (err, data) => {
        if (err) throw err;
        if (!data) return res.send("coule not delete " + _id);
        res.send(data);
      });
    });
};
