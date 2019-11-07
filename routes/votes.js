var express = require('express');
var router = express.Router();
const Vote = require('../models/vote');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


/* GET votes listing. */
router.get('/', function (req, res, next) {
  Vote.find().sort('creationDate').exec(function (err, votes) {
    if (err) {
      return next(err);
    }
    res.send(votes);
  });
});
/* POST new vote */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newVote = new Vote(req.body);

  // BUGFIX: validate ObjectId reference before attempting to save. This is to
  // avoid a Mongoose issue where casting fails before custom validation can be
  // applied: https://github.com/Automattic/mongoose/issues/8300
  if (req.body.userId && !ObjectId.isValid(req.body.userId)) {
    return res.status(422).send({
      message: `Vote validation failed: userId: must be a valid person reference`,
      errors: {
        userId: {
          message: 'must be a valid person reference',
          path: 'userId',
          value: req.body.userId
        }
      }
    });
  }

  if (req.body.benchId && !ObjectId.isValid(req.body.benchId)) {
    return res.status(422).send({
      message: `Vote validation failed: benchId: must be a valid bench reference`,
      errors: {
        benchId: {
          message: 'must be a valid bench reference',
          path: 'benchId',
          value: req.body.benchId
        }
      }
    });
  }

  // Save that document
  newVote.save(function(err, savedVote) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedVote);
  });
});



  module.exports = router;