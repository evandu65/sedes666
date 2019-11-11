var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

/* GET users listing. */
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
        preserveNullAndEmptyArrays: true
      }
    },
    {
      //format de sortie
      $group: {
        _id: '$_id',
        username: { "$first": '$username' },
        password: { "$first": '$password' },
        countBench: {  $sum: 1 }
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
