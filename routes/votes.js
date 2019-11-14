var express = require('express');
var router = express.Router();
const Vote = require('../models/vote');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const debug = require('debug')('demo:votes');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

///////////////////////////////////////////////////////////////////////////////////////////
// AUTHENTICATION
function authenticate(req, res, next) {
  // Ensure the header is present.
  const authorization = req.get('Authorization');
  if (!authorization) {
    return res.status(401).send('Authorization header is missing');
  }
  // Check that the header has the correct format.
  const match = authorization.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).send('Authorization header is not a bearer token');
  }
  // Extract and verify the JWT.
  const token = match[1];
  jwt.verify(token, secretKey, function(err, payload) {
    if (err) {
      return res.status(401).send('Your token is invalid or has expired');
    } else {
      req.currentUserId = payload.sub;
      next(); // Pass the ID of the authenticated user to the next middleware.
    }
  });
}
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {get} /api/votes Retrieve all votes
 * @apiName RetrieveVotes
 * @apiGroup Vote
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a paginated list of all votes ordered by date (reverse-chronological order)
 *
 * @apiUse VoteInResponseBody
 *
 * @apiExample Example
 *     GET /api/votes
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://sedes666.herokuapp.com/api/votes
 *
 *     [
 *        {
 *        "id" : "5dc3f77bed705e0017873ed1"
 *        "type": true,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "5a2539b41c574006c46f1a07",
 *        "benchId": "5db6f9a2070b2c0017c06b77",
 *        "__v":0
 *        },
 *        {
 *        "_id" : "5dc978cb7245260017491963",
 *        "type": false,
 *        "voteDate": "2019-11-9T15:20:26.468Z",
 *        "userId": "58b2926f5e1def0123e97281",
 *        "benchId": "4242922f5f6eha3123e97286",
 *        "__v":0
 *        }
 *     ]
 */
/* GET votes listing. */
router.get('/',authenticate, function (req, res, next) {
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
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @api {get} /api/votes/:id Retrieve a vote
 * @apiName RetrieveVote
 * @apiGroup Vote
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a vote
 *
 * @apiUse VoteIdInUrlPath
 * @apiUse VoteInResponseBody
 * @apiUse VoteNotFoundError
 * 
 * @apiSuccess (Response body) {String} id The unique identifier of the vote 
 * @apiSuccess (Response body) {String} votename The name of the vote (unique)
 * @apiSuccess (Response body) {String} password The secret pass of the vote
 * @apiSuccess (Response body) {String} registrationDate The registration date of the vote
 *
 * @apiExample Example
 *     GET /api/votes/58b2926f5e1def0123e97281
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *        {
 *        "_id" : "58b2926f5e1def0123e97281"
 *        "type": true,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "5a2539b41c574006c46f1a07",
 *        "benchId": "5db6f9a2070b2c0017c06b77",
 *        "__v":0
 *        }
 */
router.get('/:id',authenticate, loadVoteFromParamsMiddleware, function (req, res, next) {
  res.send(req.vote);
});

///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {post} /api/users Create a vote
 * @apiName CreateVote
 * @apiGroup Vote
 * @apiVersion 1.0.0
 * @apiDescription Register a new vote.
 *
 * @apiUse VoteInRequestBody
 * @apiUse VoteInResponseBody
 * @apiUse VoteValidationError
 * @apiSuccess (Response body) {String} id A unique identifier for the user generated by the server
 *
 * @apiExample Example
 *     POST /api/users HTTP/1.1
 *     Content-Type: application/json
 *
 *        {
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "5a2539b41c574006c46f1a07",
 *        "benchId": "5db6f9a2070b2c0017c06b77"
 *        }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://sedes666.herokuapp.com/api/votes/5db6f9a2070b2c0017c06b77
 *
 *        {
 *        "_id" : "58b2926f5e1def0123e97281"
 *        "type": true,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "5a2539b41c574006c46f1a07",
 *        "benchId": "5db6f9a2070b2c0017c06b77",
 *        "__v":0
 *        }
 */
/* POST new vote */
router.post('/', authenticate, function(req, res, next) {
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
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {delete} /api/votes/:id Delete a vote
 * @apiName DeleteVote
 * @apiGroup Vote
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a vote.
 *
 * @apiUse VoteIdInUrlPath
 * @apiUse VoteNotFoundError
 *
 * @apiExample Example
 *     DELETE /api/votes/58b2926f5e1def0123e97281 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */
/* DELETE a vote */
router.delete('/:id',authenticate, function(req, res, next) {
  const id = req.params.id;
  Vote.deleteOne({ _id: id}, function (err, deleteVote) {
    if (err){ 
      return next(err);
    }
  res.send(`Vote ${id} has been deleted ;)`)
});
});
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {patch} /api/votes/:id Update a vote
 * @apiName UpdateVote
 * @apiGroup Vote
 * @apiVersion 1.0.0
 * @apiDescription Inverse vote type.
 *

 * @apiUse VoteInRequestBody
 * @apiUse VoteInResponseBody
 * @apiUse VoteIdInUrlPath
 * @apiUse VoteNotFoundError
 *
 * @apiExample Example
 *     PATCH /api/votes/58b2926f5e1def0123e97281 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "type": false,
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *        "_id" : "58b2926f5e1def0123e97281"
 *        "type": false,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "5a2539b41c574006c46f1a07",
 *        "benchId": "5db6f9a2070b2c0017c06b77",
 *        "__v":0
 *     }
 */
/* PATCH a vote */
router.patch('/:id',authenticate, loadVoteFromParamsMiddleware, function (req, res, next) {
  // Update only properties present in the request body

  if (req.body.type !== undefined) {
    req.vote.type = req.body.type;
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
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @apiDefine VoteInRequestBody
 * @apiSuccess (Response body) {Boolean} type Vote type, up or down (0=false=down|1=true=up)
 * @apiSuccess (Response body) {ObjectId} userId The user id
 * @apiSuccess (Response body) {ObjectId} benchId The bench id
 */

/**
 * @apiDefine VoteInResponseBody
 * @apiSuccess (Response body) {String} id The unique identifier of the vote
 * @apiSuccess (Response body) {Boolean} type Vote type, up or down (0=false=down|1=true=up)
 * @apiSuccess (Response body) {String} voteDate The date of the vote
 * @apiSuccess (Response body) {ObjectId} userId The user id
 * @apiSuccess (Response body) {ObjectId} benchId The bench id
 */

/**
 * @apiDefine VoteNotFoundError
 *
 * @apiError {Object} 404/NotFound No vote was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No vote found with ID 5db6f9a2070b2c0017c06b77
 */

 /**
 * @apiDefine VoteIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the vote to retrieve
 */

/**
 * @apiDefine VoteValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Some of the vote's properties are invalid
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 *     {
 *       "message": "vote validation failed",
 *       "errors": {
 *         "benchId": {
 *           "kind": "notFound",
 *           "message": "Path `benchId` not found",
 *           "name": "ValidatorError",
 *           "path": "benchId",
 *           "properties": {
 *             "message": "Path `{PATH}` (`{VALUE}`) not found",
 *             "minlength": 3,
 *             "path": "benchId",
 *             "type": "notFound",
 *             "value": "0"
 *           },
 *           "value": "0"
 *         }
 *       }
 *     }
 */
  module.exports = router;