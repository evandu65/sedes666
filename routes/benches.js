var express = require('express');
var router = express.Router();
const Bench = require('../models/bench');

/* GET benches listing. */
router.get('/', function (req, res, next) {
  Bench.find().sort('score').exec(function (err, benches) {
    if (err) {
      return next(err);
    }
    res.send(benches);
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
  router.delete('/:id', function(req, res, next) {
      const id = req.params.id;
      Bench.deleteOne({ _id: id}, function (err) {
        if (err){ 
          return next(err);
        }
      })
      res.send(`Bench id ${id} deleted`)
  });
  
  module.exports = router;