var express = require('express');
var router = express.Router();
const Bench = require('../models/bench');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/* GET benches listing. */
router.get('/', function (req, res, next) {
  Bench.find().sort('score').exec(function (err, benches) {
    if (err) {
      return next(err);
    }
    res.send(benches);
  });
});
router.get('/:id',loadMovieFromParamsMiddleware, function (req, res, next) {
    res.send(req.bench);
  });
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
/* DELETE a bench */
  router.delete('/:id', function(req, res, next) {
      const id = req.params.id;
      Bench.deleteOne({ _id: id}, function (err, deleteBench) {
        if (err){ 
          return next(err);
        }
      res.send(`bench ${id} has been deleted ;)`)
    });
  });
/* */
  

  /* PATCH a bench */
  router.patch('/:id', loadMovieFromParamsMiddleware, function (req, res, next) {

    // Update only properties present in the request body
    if (req.body.id !== undefined) {
      req.bench.id = req.body.id;
    }
  
    if (req.bench.score !== undefined) {
      req.bench.score = req.body.score;
    }
  
    req.bench.save(function (err, savedBench) {
      if (err) {
        return next(err);
      }
  
      debug(`Updated bench "${savedBench.title}"`);
      res.send(savedBench);
    });
  });

  function loadMovieFromParamsMiddleware(req, res, next) {

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