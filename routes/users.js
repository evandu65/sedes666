var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

/* GET users listing. */
router.get('/', function (req, res, next) {
  User.find().sort('username').exec(function (err, users) {
    if (err) {
      return next(err);
    }
    res.send(users);
  });
});

/* POST new user */
router.post('/', function (req, res, next) {

  //encrypt the password

  const plainPassword = req.body.password;
  const saltRounds = 10;
  bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {

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
      res.send(`Welcome ${savedUser.username}`);
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

module.exports = router;
