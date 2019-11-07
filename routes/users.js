var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';
const ObjectId = mongoose.Types.ObjectId;
const debug = require('debug')('demo:users');


/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find().sort('username').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
});
router.get('/:id',loadUserFromParamsMiddleware, function (req, res, next) {
  res.send(req.vote);
});
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
       jwt.sign(claims, secretKey, function(err, token) {
         if (err) { return next(err); }
         res.send({ token: token }); // Send the token to the client.

          // Login is valid...
      //res.send(`Welcome ${user.username}!`);
    });
  });
});
});
/************************/
/* DELETE a user */
router.delete('/:id', function(req, res, next) {
  const id = req.params.id;
  User.deleteOne({ _id: id}, function (err, deleteUser) {
    if (err){ 
      return next(err);
    }
  res.send(`User ${id} has been deleted ;)`)
});
});
/************************/
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

    debug(`Updated user "${userVote.id}"`);
    res.send(userVote);
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
