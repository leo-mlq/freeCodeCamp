/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("API ROUTING FOR /api/threads/:board", function() {
    suite("POST", function() {
      test("post new thread to test", function(done) {
        chai
          .request(server)
          .post("/api/threads/test")
          .send({
            board: "test",
            text: "test post new thread",
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);

            done();
          });
      });
    });

    suite("GET", function() {
      test("get board test", function(done) {
        chai
          .request(server)
          .get("/api/threads/test")
          .query()
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.equal(res.body[0].board, "test");
            assert.isAtMost(res.body.length, 10);
            done();
          });
      });
    });

    suite("DELETE", function() {
      test("delete with incorrect password", function(done) {
        chai
          .request(server)
          .delete("/api/threads/test")
          .send({
            board: "test",
            thread_id: "5e49087024ccc455cc7e39de",
            delete_password: "asdasd"
          })
          .end(function(req, res) {
            assert.equal(res.text, "Incorrect password");
            done();
          });
      });
    });

    suite("PUT", function() {
      test("put valid inputs", function(done) {
        chai
          .request(server)
          .put("/api/threads/test")
          .send({ board: "test", thread_id: "5e49087024ccc455cc7e39de" })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "Updated!");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function() {
    suite("POST", function() {
      test("post a reply", function(done) {
        chai
          .request(server)
          .post("/api/replies/test")
          .send({
            board: "test",
            thread_id: "5e4ba1cdfa3b8523ff16ea99",
            text: "post from chai",
            delete_password: "123"
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.redirects.length, 1);
            done();
          });
      });
    });

    suite("GET", function() {
      test("get replies", function(done) {
        chai
          .request(server)
          .get("/api/threads/test")
          .query()
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body[0].replies);
            assert.isAtMost(res.body[0].replies.length, 3);
            done();
          });
      });
    });

    suite("PUT", function() {});

    suite("DELETE", function() {});
  });
});
