/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var connection = require("../utils/database");
var bcrypt = require("bcrypt");
var Promise = require("promise");
var ObjectID = require("mongodb").ObjectID;
var { throwError, throwIf, sendError } = require("../utils/errorHandlers");

module.exports = async function(app, db) {
  app
    .route("/api/threads/:board")
    .post(async function(req, res) {
      var board = req.params.board;
      var text = req.body.text;
      var delete_password = req.body.delete_password;
      var create_on = new Date();
      var bumped_on = create_on;
      var reported = false;
      var replies = [];

      var collections = await db.listCollections().toArray();

      if (!collections.map(c => c.name).includes(board)) {
        await db.createCollection(board);
      }

      var col = await db.collection(board);
      var col_entry = await col.insertOne({
        board: board,
        text: text,
        delete_password: bcrypt.hashSync(delete_password, 11),
        create_on: create_on,
        bumped_on: bumped_on,
        reported: reported,
        replies: replies,
        replycount: 0
      });
      res.status(200).redirect("/b/" + board + "/");
    })
    .get(async function(req, res) {
      var board = req.params.board;
      var collections = await db.listCollections().toArray();

      if (!collections.map(c => c.name).includes(board)) {
        res.status(400)
          .type("txt")
          .send("Board doesn't exist");
      } else {
        var col = await db.collection(board);
        var col_entries = await col
          .find()
          .sort({ bumped_on: -1 })
          .limit(10)
          .toArray();
        var threads = await Promise.all(
          col_entries.map(entry => {
            return new Promise(resolve =>
              setTimeout(() => {
                var replies_len = entry.replies.length;
                if (replies_len > 3) {
                  entry.replies.splice(3, replies_len);
                }
                resolve(entry);
              }, 100)
            );
          })
        );
        //console.log(threads);
        res.status(200).json(threads);
      }
    })
    .put(async function(req, res) {
      var board = req.params.board;
      var thread_id = req.body.thread_id;
      var collections = await db.listCollections().toArray();

      if (!collections.map(c => c.name).includes(board)) {
        res.type("txt").send("Board doesn't exist!");
      } else {
        var col = await db.collection(board);

        if (!ObjectID.isValid(thread_id))
          res.type("txt").send("Invalid thread ID");
        else {
          var col_entry = await col.findOneAndUpdate(
            { _id: ObjectID(thread_id) },
            { $set: { reported: true, bumped_on: new Date() } },
            { returnNewDocument: true }
          );
          if (!col_entry.value) res.send("Thread doesn't exist!");
          else
            res
              .type("txt")
              .status(200)
              .send("success");
        }
      }
    })
    .delete(async function(req, res) {
      var board = req.params.board;
      var thread_id = req.body.thread_id;
      var delete_password = req.body.delete_password;
      var collections = await db.listCollections().toArray();

      if (!collections.map(c => c.name).includes(board)) {
        res.type("txt").send("Board doesn't exist!");
      } else {
        var col = await db.collection(board);

        if (!ObjectID.isValid(thread_id))
          res.type("txt").send("Invalid thread ID");
        else {
          var col_entry = await col.findOne({ _id: ObjectID(thread_id) });

          if (!col_entry) res.send("Thread doesn't exist!");
          else {
            if (
              !bcrypt.compareSync(delete_password, col_entry.delete_password)
            ) {
              res.send("Incorrect password");
            } else {
              try {
                await col.deleteOne({ _id: ObjectID(thread_id) });
                res.status(200).send("success");
              } catch (err) {
                throw err;
              }
            }
          }
        }
      }
    });
  app
    .route("/api/replies/:board")
    .post(async function(req, res, next) {
      var board = req.params.board;
      var reply = {
        reply_id: ObjectID(),
        text: req.body.text,
        created_on: new Date(),
        delete_password: bcrypt.hashSync(req.body.delete_password, 11),
        reported: false
      };
      var thread_id = req.body.thread_id;
      var col = await db.collection(board);
      try {
        await col.findOneAndUpdate(
          { _id: ObjectID(thread_id) },
          { $push: { replies: reply }, $inc: { replycount: +1 } },
          { returnNewDocument: true }
        );
        res.status(200).redirect("/b/" + board + "/" + thread_id);
      } catch (err) {
        throw err;
      }
    })
    .get(async function(req, res, next) {
      var board = req.params.board;
      // ajax data :{thread_id: ID}, use query wheras serialize() use body
      var thread_id = req.query.thread_id;

      var col = await db.collection(board);
      try {
        var col_entry = await col
          .findOne({ _id: ObjectID(thread_id) })
          .then(
            throwIf(r => !r, 400, "not found", "Thread Not Found"),
            throwError(500, "sequelize error")
          );
        res.status(200).json(col_entry);
      } catch (err) {
        sendError(res)(err);
      }
    })
    .put(async function(req, res) {
      var board = req.params.board;
      var { thread_id, reply_id } = req.body;
      var col = await db.collection(board);
      try {
        col.findOneAndUpdate(
          { _id: ObjectID(thread_id), "replies.reply_id": ObjectID(reply_id) },
          { $set: { "replies.$.reported": true } }
        );
        res.status(200).send("reported");
      } catch (err) {
        throw err;
      }
    })
    .delete(async function(req, res) {
      var board = req.params.board;
      var thread_id = req.body.thread_id;
      var reply_id = req.body.reply_id;
      var delete_password = req.body.delete_password;

      var col = await db.collection(board);

      try {
        var reply = await col.findOne(
          { _id: ObjectID(thread_id) },
          { replies: { $elemMatch: { reply_id: ObjectID(reply_id) } } }
        );

        if (
          !bcrypt.compareSync(delete_password, reply.replies[0].delete_password)
        ) {
          res.send("Incorrect password");
        } else {
          var t = await col.findOneAndUpdate(
            { _id: ObjectID(thread_id) },
            {
              $pull: { replies: { reply_id: ObjectID(reply_id) } },
              $inc: { replycount: -1 }
            }
          );

          res.status(200).send("success");
        }
      } catch (err) {
        throw err;
      }
    });
};
