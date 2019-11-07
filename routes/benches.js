var express = require('express');
var router = express.Router();
const Bench = require('../models/bench');

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

      // Filter movies by director
  if (ObjectId.isValid(req.query.director)) {
    query = query.where('director').equals(req.query.director);
  }
    
    // Apply skip and limit to select the correct page of elements
      query = query.skip((page - 1) * pageSize).limit(pageSize);
  
    // Parse query parameters and apply pagination here...
     query.exec(function(err, benches) {
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
  module.exports = router;
