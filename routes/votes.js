var express = require('express');
var router = express.Router();
const Vote = require('../models/vote');

/* POST new vote */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newVote = new Vote(req.body);
  // Save that document
  newVote.save(function(err, savedVote) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedVote);
  });
});

/* GET all votes */
  router.get('/', function (req, res, next) {
    Vote.find().exec(function (err, votes) {
      if (err) {
        return next(err);
      }
      res.send(votes);
    });
  });

  module.exports = router;