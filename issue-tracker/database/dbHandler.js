var mongo = require("mongodb");
const mongoose = require("mongoose");
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
const issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_on: Date,
  updated_on: Date,
  created_by: String,
  assigned_to: String,
  open: Boolean,
  status_text: String
});

var issueModel = mongoose.model("apitest", issueSchema);

module.exports = function DBHandeler() {
  this.createIssue = function(
    _title,
    _text,
    _author,
    _asignee,
    _status,
    _date,
    _update,
    _isopen,
    done
  ) {
    var issue = new issueModel({
      issue_title: _title,
      issue_text: _text,
      created_on: _date,
      updated_on: _update,
      created_by: _author,
      assigned_to: _asignee,
      open: _isopen,
      status_text: _status
    });
    issue.save((err, data) => {
      if (err) return done(err);
      done(null, issue._id);
    });
  };
  this.updateIssue = function(
    _id,
    _title,
    _text,
    _author,
    _asignee,
    _status,
    _update,
    _isopen,
    done
  ) {
    issueModel.findById(_id, (err, data) => {
      if (err) return done(err);
      if (!data) return done(null, null);

      if (_title != "" && _title != undefined) data.issue_title = _title;
      if (_text != "" && _text != undefined) data.issue_text = _text;
      if (_author != "" && _author != undefined) data.created_by = _author;
      if (_asignee != "" && _asignee != undefined) data.assigned_to = _asignee;
      if (_status != "" && _status != undefined) data.status_text = _status;
      if (_isopen != undefined) data.open = _isopen;
      data.updated_on = _update;
      data.save(err => {
        if (err) done(err);
        done(null, "sucessfully updated");
      });
    });
  };
  this.deleteIssue = function(_id, done) {
    issueModel.findById(_id, (err, data) => {
      if (err) return done(err);
      if (!data) return done(null, null);
      issueModel.deleteOne({ _id: _id }, err => {
        if (err) throw err;
        done(null, "deleted " + _id);
      });
    });
  };
  this.findAll = function(done) {
    var asyncGetIssues = function(issue) {
      var ret = {
        issue_title: issue.issue_title,
        issue_text: issue.issue_text,
        created_on: issue.created_on,
        updated_on: issue.updated_on,
        created_by: issue.created_by,
        open: issue.open,
        _id: issue._id
      };
      if (issue.assigned_to) ret["assigned_to"] = issue.assigned_to;
      if (issue.status_text) ret["status_text"] = issue.status_text;
      return new Promise(resolve => {
        setTimeout(() => resolve(ret), 100);
      });
    };
    issueModel.find({}, (err, issues) => {
      if (err) done(err);
      Promise.all(issues.map(asyncGetIssues)).then(data => done(null, data));
    });
  };
};
