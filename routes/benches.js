var express = require('express');
var router = express.Router();
const Bench = require('../models/bench');

/* POST new bench */
router.post('/', function(req, res, next) {
    // Create a new document from the JSON in the request body
    const newBench = new Bench(req.body);
    // Save that document
    newBench.save(function(err, savedBench) {
      if (err) {
        return next(err);
      }
      // Send the saved document in the response
      res.send(savedBench);
    });
  });

  module.exports = router;