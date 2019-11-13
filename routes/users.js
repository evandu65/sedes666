///////////////////////////////////////////////////////////////////////////////////////////
var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Vote = require('../models/vote');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const debug = require('debug')('demo:users');
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {get} /api/users Retrieve all users
 * @apiName RetrieveUsers
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a paginated list of users ordered by username (in alphabetical order).
 *
 * @apiUse UserInResponseBody
 *
 * @apiExample Example
 *     GET /api/users
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Link: &lt;https://sedes666.herokuapp.com/api/users
 *
 *     [
 *        {
 *       "id": "58b2926f5e1def0123e97280",
 *       "username": "MattStone",
 *       "password": "EyOLWDkNG2S8U2S4BF24BebhZUgxYpUyoa9qj1SJEOfwhf2PKB9O",
 *       "registrationDate": "2019-12-9T15:10:10.468Z",
 *       "__v":0
 *        },
 *        {
 *        "id": "58b2926f5e1def0123e97281",
 *        "username": "TreyParker",
 *        "password": "$2a$07$hndQIDW9dAPAZMRdyp5Cg.IHk1B0p/bNFHXGBntbXsvIktFWkX1L.",
 *        "registrationDate": "2019-11-9T15:20:56.468Z",
 *        "__v":0
 *        }
 *     ]
 */
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

  User.aggregate([
    {
      //équivalent inner join
      $lookup: {
        from: 'benches',
        localField: '_id',
        foreignField: 'userId',
        as: 'countBench'
      }
    },
    {
      $unwind: {
        path: '$countBench',
        // Preserve people who have not directed any movie
        // ("countBench" will be null).
        preserveNullAndEmptyArrays: true
      }
    },
    // Replace "countBench" by 1 when set, or by 0 when null.
    {
      $set: {
        countBench: {
          $cond: {
            if: '$countBench',
            then: 1,
            else: 0
          }
        }
      }
    },
    {
      //format de sortie
      $group: {
        _id: '$_id',
        username: { "$first": '$username' },
        password: { "$first": '$password' },
        // Sum the 1s and 0s in the "countBench" property
        // to obtain the final count.
        countBench: { $sum: '$countBench' },
      }
    },
    {
      $sort: {
        countBench: -1
      }
    },
    {
      $skip: (page - 1) * pageSize
    },
    {
      $limit: pageSize
    }
  ],
    (err, userSort) => {
      if (err) {
        return next(err);
      }
      User.find().count(function (err, total) {
        if (err) {
          return next(err);
        }
        let UserSerialized = userSort.map(user => {

          const serialized = new User(user).toJSON();

          serialized.countBench = user.countBench;

          return serialized;
        });

        res.send(
          {
            page: page,
            pageSize: pageSize,
            total: total,
            data: UserSerialized
          }
        );
      });
    });
});
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @api {get} /api/users/:id Retrieve a user
 * @apiName RetrieveUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a user
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserInResponseBody
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     GET /api/users/58b2926f5e1def0123e97281
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *        {
 *        "id": "58b2926f5e1def0123e97281",
 *        "username": "TreyParker",
 *        "password": "$2a$07$hndQIDW9dAPAZMRdyp5Cg.IHk1B0p/bNFHXGBntbXsvIktFWkX1L.",
 *        "registrationDate": "2019-11-9T15:20:56.468Z",
 *        "__v":0
 *        }
 */
router.get('/:id', loadUserFromParamsMiddleware, function (req, res, next) {
  res.send(req.user);
});
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {get} /api/users/:id/votes Retrieve all user's votes
 * @apiName RetrieveUserVotes
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Retrieve a paginated list of user's votes ordered by date (reverse-chronological order)
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     GET /api/users/58b2926f5e1def0123e97281/votes
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *        {
 *        "_id" : "5dc3f77bed705e0017873ed1",
 *        "type": true,
 *        "voteDate": "2019-11-9T15:20:56.468Z",
 *        "userId": "58b2926f5e1def0123e97281",
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
 */
router.get('/:id/votes', loadUserFromParamsMiddleware, function (req, res, next) {
  
  // Count total votes matching the URL query parameters
  const countQuery = req;
  countQuery.count(function (err, total) {
    if (err) {
      return next(err);
    }

    // Prepare the initial database query from the URL query parameters
    let query = queryVotes(req);

    // Parse pagination parameters from URL query parameters
    const { page, pageSize } = utils.getPaginationParameters(req);

    // Apply the pagination to the database query
    query = query.skip((page - 1) * pageSize).limit(pageSize);

    // Add the Link header to the response
    utils.addLinkHeader('/api/users/:id/votes', page, pageSize, total, res);
    query.find({ userId: req.user.id }).sort('-voteDate').exec(function (err, votes) {
      if (err) {
        return next(err);
      }
      res.send(votes);
    });
  })
  });


///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {post} /api/users Create a user
 * @apiName CreateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Register a new user.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserValidationError
 * @apiSuccess (Response body) {String} id A unique identifier for the user generated by the server
 *
 * @apiExample Example
 *     POST /api/users HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "username": "TreyParker",
 *       "password": "301",
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://sedes666.herokuapp.com/api/users/58b2926f5e1def0123e97281
 *
 *     {
 *       "id": "58b2926f5e1def0123e97281",
 *       "username": "TreyParker",
 *       "password": "$2a$07$hndQIDW9dAPAZMRdyp5Cg.IHk1B0p/bNFHXGBntbXsvIktFWkX1L.",
 *       "registrationDate": "2019-11-9T15:20:56.468Z",
 *       "__v":0
 *     }
 */
router.post('/', function (req, res, next) {
  //encrypt the password
  const plainPassword = req.body.password;
  const saltRounds = 10;
  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    newUser.password = hashedPassword;
    // Save that document
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
      // Send the saved document in the response
      console.log(`Welcome ${savedUser.username}`);
      res.send(savedUser);
    });
  });
});
///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {post} /api/users/login Login a user
 * @apiName Login
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Login a user.
 *
 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserValidationError
 * @apiSuccess (Response body) {String} id A unique identifier for the user generated by the server
 *
 * @apiExample Example
 *     POST /api/users HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "username": "TreyParker",
 *       "password": "301",
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://sedes666.herokuapp.com/api/users/58b2926f5e1def0123e97281
 *
 *     {
 *       "id": "58b2926f5e1def0123e97281",
 *       "username": "TreyParker",
 *       "password": "$2a$07$hndQIDW9dAPAZMRdyp5Cg.IHk1B0p/bNFHXGBntbXsvIktFWkX1L.",
 *       "registrationDate": "2019-11-9T15:20:56.468Z",
 *       "__v":0
 *     }
 */
router.post('/login', function (req, res, next) {
  User.findOne({ username: req.body.username }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.sendStatus(401);
    }
  });
});

///////////////////////////////////////////////////////////////////////////////////////////

//     -----------------------------
//     // Apply skip and limit to select the correct page of elements
//     query = query.skip((page - 1) * pageSize).limit(pageSize);

//   // Parse query parameters and apply pagination here...
//   query.exec(function (err, benches) {
//     if (err) { return next(err); }
//     // Send JSON envelope with data
//     res.send({
//       page: page,
//       pageSize: pageSize,
//       total: total,
//       data: benches
//     });
//   });
//   // });
//   User.find().sort('username').exec(function (err, users) {
//     if (err) {
//       return next(err);
//     }
//     res.send(users);
//   });
// });
// -----------------------------


/* POST new user */
router.post('/', function (req, res, next) {
  //encrypt the password

  const plainPassword = req.body.password;
  const saltRounds = 10;
  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    // Create a new document from the JSON in the request body
    const newUser = new User(req.body);
    newUser.password = hashedPassword;
    // Save that document
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }
      // Send the saved document in the response
      console.log(`Welcome ${savedUser.username}`);
      res.send(savedUser);
    });
  });
});

/* LOGIN user */
router.post('/login', function (req, res, next) {
  User.findOne({ username: req.body.username }).exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return res.sendStatus(401);

    }
    bcrypt.compare(req.body.password, user.password, function (err, valid) {
      if (err) {
        return next(err);
      } else if (!valid) {
        return res.sendStatus(401);
      }
      // Generate a valid JWT which expires in 7 days.
      const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
      const claims = { sub: user._id.toString(), exp: exp };
      jwt.sign(claims, secretKey, function (err, token) {
        if (err) { return next(err); }
        res.send({ token: token }); // Send the token to the client.

        // Login is valid...
        //res.send(`Welcome ${user.username}!`);
      });
    });
  });
});

module.exports = router;

///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {delete} /api/users/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a user.
 *
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 *
 * @apiExample Example
 *     DELETE /api/people/58b2926f5e1def0123e97281 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */
/* DELETE a user */
router.delete('/:id', function (req, res, next) {
  const id = req.params.id;
  User.deleteOne({ _id: id }, function (err, deleteUser) {
    if (err) {
      return next(err);
    }
    res.send(`User ${id} has been deleted ;)`)
  });
});


///////////////////////////////////////////////////////////////////////////////////////////
/**
 * @api {patch} /api/users/:id Update a user
 * @apiName UpdateUser
 * @apiGroup User
 * @apiVersion 1.0.0
 * @apiDescription Replace specified user's data.
 *

 * @apiUse UserInRequestBody
 * @apiUse UserInResponseBody
 * @apiUse UserIdInUrlPath
 * @apiUse UserNotFoundError
 * @apiUse UserValidationError
 *
 * @apiExample Example
 *     PATCH /api/users/58b2926f5e1def0123e97281 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "password": "newPassword"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "id": "58b2926f5e1def0123e97281",
 *       "password": "$2a$07$YQI9k8fqscj5dawrlLquaON2/C66ZaNIXL4kAA922my/dAB7xNHru"
 *     }
 */
/* PATCH a user */
router.patch('/:id', loadUserFromParamsMiddleware, function (req, res, next) {
  const plainPassword = req.body.password;
  const saltRounds = 10;
  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
    if (err) {
      return next(err);
    }
    req.user.password = hashedPassword;
    req.user.save(function (err, savedUser) {
      if (err) {
        return next(err);
      }

      debug(`Updated user "${savedUser.id}"`);
      res.send(savedUser);
    });
  });
});

///////// 
function loadUserFromParamsMiddleware(req, res, next) {

  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }

  let query = User.findById(userId)

  query.exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return userNotFound(res, userId);
    }

    req.user = user;
    next();
  });
}
function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}

module.exports = router;
///////////////////////////////////////////////////////////////////////////////////////////

/**
 * @apiDefine UserInRequestBody
 * @apiParam (Request body) {String{3..50}} username The name of the user (unique)
 * @apiParam (Request body) {String{3..60}} password The secret pass of the suser
 */

/**
 * @apiDefine UserInResponseBody
 * @apiSuccess (Response body) {String} id The unique identifier of the user
 * @apiSuccess (Response body) {String} username The name of the user (unique)
 * @apiSuccess (Response body) {String} password The secret pass of the user
 * @apiSuccess (Response body) {String} registrationDate The registration date of the user
 */

 /**
 * @apiDefine UserNotFoundError
 *
 * @apiError {Object} 404/NotFound No user was found corresponding to the ID in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No person found with ID 58b2926f5e1def0123e97281
 */

 /**
 * @apiDefine UserIdInUrlPath
 * @apiParam (URL path parameters) {String} id The unique identifier of the user to retrieve
 */

/**
 * @apiDefine UserValidationError
 *
 * @apiError {Object} 422/UnprocessableEntity Some of the user's properties are invalid
 *
 * @apiErrorExample {json} 422 Unprocessable Entity
 *     HTTP/1.1 422 Unprocessable Entity
 *     Content-Type: application/json
 *
 *     {
 *       "message": "user validation failed",
 *       "errors": {
 *         "username": {
 *           "kind": "minlength",
 *           "message": "Path `username` (`0`) is shorter than the minimum allowed length (3).",
 *           "name": "ValidatorError",
 *           "path": "username",
 *           "properties": {
 *             "message": "Path `{PATH}` is shorter than the minimum allowed length (3).",
 *             "minlength": 3,
 *             "path": "username",
 *             "type": "minlength",
 *             "value": "0"
 *           },
 *           "value": "0"
 *         }
 *       }
 *     }
 */