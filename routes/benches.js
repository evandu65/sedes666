var express = require('express');
var router = express.Router();
const Bench = require('../models/bench');
const Vote = require('../models/vote');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const debug = require('debug')('demo:benches');

///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {get} /api/benches Retrieve all benches
 * @apiName RetrieveBenches
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a paginated list of all benches ordered by score (descending order)
 *
 * @apiUse BenchInResponseBody
 *
 * @apiExample Example
 *     GET /api/benches
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://sedes666.herokuapp.com/api/benches
 *
 *     [
  *     {
 *       "id": "58b2926f5e1def0123e97286",
 *       "userId" : "58b2926f5e1def0123e97281",
 *       "description": "Nice bench with a beautiful view on the lake",
 *       "creationDate": "2019-11-9T15:20:56.468Z",
 *       "modificationDate": "2019-11-9T15:20:56.468Z",
 *       "score" : "210",
 *       "backrest": "0",
 *       "material": "Wood",
 *       "ergonomy": "2",
 *       "seats" : 3,
 *       "image" : "beautifulbench.jpg",
 *       "location" : {
 *          "type" : "Point"
 *          "coordinates" :  [52.373666, 4.896888]
 *         }
 *       "__v":0
 *     },
 *     {
 *       "id": "5db6f9a2070b2c0017c06b77",
 *       "userId" : "5a2539b41c574006c46f1a07",
 *       "description": "Relaxing forest bench",
 *       "creationDate": "2019-11-9T15:20:56.468Z",
 *       "modificationDate": "2019-11-9T15:20:56.468Z",
 *       "score" : "198",
 *       "backrest": "1",
 *       "material": "Plastic",
 *       "ergonomy": "4",
 *       "seats" : 2,
 *       "image" : "lovethisbench.jpg",
 *       "location" : {
 *          "type" : "Point"
 *          "coordinates" :  [52.393660, 4.902666]
 *         }
 *       "__v":0
 *     }
 *     ]
 */
/* GET benches listing. */
router.get('/', function (req, res, next) {
  // Parse the "page" param (default to 1 if invalid)
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  // Parse the "pageSize" param (default to 100 if invalid)
  let pageSize = parseInt(req.query.pageSize, 10);
  if (isNaN(pageSize) || pageSize < 0 || pageSize > 100) {
    pageSize = 10;
  }

  Bench.find().sort('score').count(function (err, total) {
    if (err) {
      return next(err);
    };

    let query = Bench.find();

    // Limit benches to only those with a good enough score
    if (!isNaN(req.query.ratedAtLeast)) {
      query = query.where('score').gte(req.query.ratedAtLeast);
    }

    // Apply skip and limit to select the correct page of elements
    query = query.skip((page - 1) * pageSize).limit(pageSize);

    // Parse query parameters and apply pagination here...
    query.exec(function (err, benches) {
      if (err) { return next(err); }
      // Send JSON envelope with data
      res.send({
        page: page,
        pageSize: pageSize,
        total: total,
        data: benches
      });
    });
  });
});
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @api {get} /api/benches/:id Retrieve a bench
 * @apiName RetrieveBench
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a bench
 *
 * @apiUse BenchIdInUrlPath
 * @apiUse BenchInResponseBody
 * @apiUse BenchNotFoundError
 *
 * @apiExample Example
 *     GET /api/benches/58b2926f5e1def0123e97286
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *        {
 *       "id": "58b2926f5e1def0123e97286",
 *       "userId" : "58b2926f5e1def0123e97281",
 *       "description": "Nice bench with a beautiful view on the lake",
 *       "creationDate": "2019-11-9T15:20:56.468Z",
 *       "modificationDate": "2019-11-9T15:20:56.468Z",
 *       "score" : "210",
 *       "backrest": "0",
 *       "material": "Wood",
 *       "ergonomy": "2",
 *       "seats" : 3,
 *       "image" : "beautifulbench.jpg",
 *       "location" : {
 *          "type" : "Point"
 *          "coordinates" :  [52.373666, 4.896888]
 *         }
 *       "__v":0
 *     }
 */

router.get('/:id', loadBenchFromParamsMiddleware, function (req, res, next) {
  res.send(req.bench);
});
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {get} /api/benches/:id/votes Retrieve all bench's votes
 * @apiName RetrieveBenchVotes
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a paginated list of bench's votes ordered by date (reverse-chronological order)
 *
 * @apiUse BenchIdInUrlPath
 * @apiUse BenchNotFoundError
 *
 * @apiExample Example
 *     GET /api/benches/58b2926f5e1def0123e97281/votes
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *        {
 *        "_id" : "5dc978cb7245260017491963",
 *        "type": true,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "58b2926f5e1def0123e97281",
 *        "benchId": "5db6f9a2070b2c0017c06b77",
 *        "__v":0
 *        },
 *        {
 *        "id" : "5dc3f77bed705e0017873ed1",
 *        "type": false,
 *        "voteDate": "2019-11-9T15:20:26.468Z",
 *        "userId": "58b2926f5e1def0123e97281",
 *        "benchId": "4242922f5f6eha3123e97286",
 *        "__v":0
 *        }
 */
router.get('/:id/votes', loadBenchFromParamsMiddleware, function (req, res, next) {
      Vote.find({ benchId: req.bench.id }).sort('-voteDate').exec(function (err, votes) {
        if (err) {
          return next(err);
        }
        res.send(votes);
      });
    
    })  
    
/**
 * @api {post} /api/benches Create a bench
 * @apiName CreateBench
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Register a new bench.
 *
 * @apiUse BenchInRequestBody
 * @apiUse BenchInResponseBody
 * @apiUse BenchValidationError
 * @apiSuccess (Response body) {String} id A unique identifier for the bench generated by the server
 *
 * @apiExample Example
 *     POST /api/benches HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "description": "Nice bench with a beautiful view on the lake",
 *       "backrest": "0",
 *       "material": "Wood",
 *       "ergonomy": "2",
 *       "seats" : 3,
 *       "image" : "beautifulbench.jpg",
 *       "location" : {
 *         "coordinates" : [52.373660, 4.896888]
 *         }
 *        }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://sedes666.herokuapp.com/api/benches/58b2926f5e1def0123e97286
 *
 *     {
 *       "id": "58b2926f5e1def0123e97286",
 *       "userId" : "58b2926f5e1def0123e97281",
 *       "description": "Nice bench with a beautiful view on the lake",
 *       "creationDate": "2019-11-9T15:20:56.468Z",
 *       "modificationDate": "2019-11-9T15:20:56.468Z",
 *       "backrest": "0",
 *       "material": "Wood",
 *       "ergonomy": "2",
 *       "seats" : 3,
 *       "image" : "beautifulbench.jpg",
 *       "location" : {
 *          "type" : "Point"
 *          "coordinates" :  [52.373660, 4.896888]
 *         }
 *       "__v":0
 *     }
 */
router.post('/', function (req, res, next) {
  // Create a new document from the JSON in the request body
  const newBench = new Bench(req.body);
  // Save that document
  newBench.save(function (err, savedBench) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedBench);
  });
});
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {delete} /api/benches/:id Delete a bench
 * @apiName DeleteBench
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a bench.
 *
 * @apiUse BenchIdInUrlPath
 * @apiUse BenchNotFoundError
 *
 * @apiExample Example
 *     DELETE /api/benches/58b2926f5e1def0123e97286 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */
router.delete('/:id', function (req, res, next) {
  const id = req.params.id;
  Bench.deleteOne({ _id: id }, function (err, deleteBench) {
    if (err) {
      return next(err);
    }
    res.send(`bench ${id} has been deleted ;)`)
  });
});
/* */

///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {patch} /api/benches/:id Update a bench
 * @apiName UpdateBench
 * @apiGroup Bench
 * @apiVersion 1.0.0
 * @apiDescription Replace specified bench's data.
 *

 * @apiUse BenchInRequestBody
 * @apiUse BenchInResponseBody
 * @apiUse BenchIdInUrlPath
 * @apiUse BenchNotFoundError
 * @apiUse BenchValidationError
 *
 * @apiExample Example
 *     PATCH /api/benches/58b2926f5e1def0123e97286 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "image": "newImageOfTheBeautifulBench.jpg"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "id": "58b2926f5e1def0123e97286",
 *       "userId" : "58b2926f5e1def0123e97281",
 *       "description": "Nice bench with a beautiful view on the lake",
 *       "creationDate": "2019-11-9T15:20:56.468Z",
 *       "modificationDate": "2019-11-9T15:20:56.468Z",
 *       "backrest": "0",
 *       "material": "Wood",
 *       "ergonomy": "2",
 *       "seats" : 3,
 *       "image" : "newImageOfTheBeautifulBench.jpg",
 *       "location" : {
 *          "type" : "Point"
 *          "coordinates" :  [52.373660, 4.896888]
 *         }
 *       "__v":0
 *     }
 */
/* PATCH a bench */
router.patch('/:id', loadBenchFromParamsMiddleware, function (req, res, next) {
  // Update only properties present in the request body
  if (req.body.score !== undefined) {
    req.bench.score = req.body.score;
  }
  if (req.body.material !== undefined) {
    req.bench.material = req.body.material;
  }
  if (req.body.ergonomy !== undefined) {
    req.bench.ergonomy = req.body.ergonomy;
  }
  if (req.body.image !== undefined) {
    req.bench.ergonomy = req.body.ergonomy;
  }
  req.bench.modifDate = Date.now();

  req.bench.save(function (err, savedBench) {
    if (err) {
      return next(err);
    }

    debug(`Updated bench "${savedBench.id}"`);
    res.send(savedBench);
  });
});
/************************/
/* Middle ware verification */
function loadBenchFromParamsMiddleware(req, res, next) {

  const benchId = req.params.id;
  if (!ObjectId.isValid(benchId)) {
    return benchNotFound(res, benchId);
  }

  let query = Bench.findById(benchId)

  query.exec(function (err, bench) {
    if (err) {
      return next(err);
    } else if (!bench) {
      return benchNotFound(res, benchId);
    }

    req.bench = bench;
    next();
  });
}
function benchNotFound(res, benchId) {
  return res.status(404).type('text').send(`No bench found with ID ${benchId}`);
}

module.exports = router;

/**
 * @apiDefine BenchInRequestBody
 * @apiParam (Request body) {String{3..50}} description The description of the bench 
 * @apiParam (Request body) {Boolean{0..1}} backrest The backrest parameter (0 = No|1 = Yes)
 * @apiParam (Request body) {String{Wood, Metal, Stone, Marble, Plastic}} material The material of the bench (Wood,Metal,Stone,Marble,Plastic)
 * @apiParam (Request body) {Number{0..5}} ergonomy The ergonomy mark of the bench
 * @apiParam (Request body) {Number{0..3000}} seats The number of seats on the bench
 * @apiParam (Request body) {String{0..50}} image The image of the bench
 * @apiParam (Request body) {Array} location Location array
 * @apiParam (Request body) {String{0..50}} location.type Geometrical type 
 * @apiParam (Request body) {Number{-180..180}} location.coordinates The longitude and latitude of the bench
 */

/**
 * @apiDefine BenchInResponseBody
 * @apiSuccess (Response body) {String} id The unique identifier of the bench
 * @apiSuccess (Response body) {String} userId The unique identifier of the user which create de bench 
 * @apiSuccess (Response body) {String} description The description of the bench 
 * @apiSuccess (Response body) {String} creationDate The registration date of the bench
 * @apiSuccess (Response body) {String} modificationDate The last modification date of the bench
 * @apiSuccess (Response body) {Number} score The bench's score
 * @apiSuccess (Response body) {Number} score The score of the bench (0 by default)
 * @apiSuccess (Response body) {String} material The material of the bench (Wood,Metal,Stone,Marble,Plastic)
 * @apiSuccess (Response body) {Number} ergonomy The ergonomy mark of the bench
 * @apiSuccess (Response body) {Boolean} backrest The backrest parameters
 * @apiSuccess (Response body) {Number} seats The number of seats on the bench
 * @apiSuccess (Response body) {String} registrationDate The registration date of the user
 * @apiSuccess (Response body) {Array} location Location array
 * @apiSuccess (Response body) {Array} location.type Location type array
 * @apiSuccess (Response body) {Array} location Location type
 * @apiSuccess (Response body) {String} location.type Geometrical type 
 * @apiSuccess (Response body) {Number} location.coordinates The longitude and latitude of the bench
 */

/**
 * @apiDefine BenchNotFoundError
 *
 * @apiError {Object} 404/NotFound No bench was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No bench found with ID 5db6f9a2070b2c0017c06b77
 */

 /**
 * @apiDefine BenchIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the bench to retrieve
 */

/**
 * @apiDefine BenchValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Some of the bench's properties are invalid
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 *     {
 *       "message": "bench validation failed",
 *       "errors": {
 *         "description": {
 *           "kind": "minlength",
 *           "message": "Path `description` (`0`) is shorter than the minimum allowed length (3).",
 *           "name": "ValidatorError",
 *           "path": "description",
 *           "properties": {
 *             "message": "Path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length (3).",
 *             "minlength": 3,
 *             "path": "description",
 *             "type": "minlength",
 *             "value": "0"
 *           },
 *           "value": "0"
 *         }
 *       }
 *     }
 */

