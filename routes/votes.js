var express = require('express');
var router = express.Router();
const Vote = require('../models/vote');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const debug = require('debug')('demo:votes');

/************************/
/* GET votes listing. */
router.get('/', function (req, res, next) {
  Vote.find().sort('creationDate').exec(function (err, votes) {
    if (err) {
      return next(err);
    }
    res.send(votes);
  });
});
router.get('/:id',loadVoteFromParamsMiddleware, function (req, res, next) {
  res.send(req.vote);
});
/************************/
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
/************************/
/* DELETE a vote */
router.delete('/:id', function(req, res, next) {
  const id = req.params.id;
  Vote.deleteOne({ _id: id}, function (err, deleteVote) {
    if (err){ 
      return next(err);
    }
  res.send(`Vote ${id} has been deleted ;)`)
});
});
/************************/
/* PATCH a vote */
router.patch('/:id', loadVoteFromParamsMiddleware, function (req, res, next) {
  // Update only properties present in the request body
  if (req.body.type != undefined) {
    req.vote.type = req.vote.type;
  }
  req.vote.voteDate = Date.now();
  req.vote.save(function (err, savedVote) {
    if (err) {
      return next(err);
    }

    debug(`Updated vote "${savedVote.id}"`);
    res.send(savedVote);
  });
});



function loadVoteFromParamsMiddleware(req, res, next) {

  const voteId = req.params.id;
  if (!ObjectId.isValid(voteId)) {
    return voteNotFound(res, voteId);
  }

  let query = Vote.findById(voteId)

  query.exec(function (err, vote) {
    if (err) {
      return next(err);
    } else if (!vote) {
      return voteNotFound(res, voteId);
    }

    req.vote = vote;
    next();
  });
}
function voteNotFound(res, voteId) {
  return res.status(404).type('text').send(`No vote found with ID ${voteId}`);
}

  module.exports = router;