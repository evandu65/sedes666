var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

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
      console.log(savedUser)
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
        console.log("nul");
        return res.sendStatus(401);
      }
      // Login is valid...
      res.send(`Welcome ${user.username}!`);
    });
  })
});

module.exports = router;
