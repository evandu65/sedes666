const User = require('../models/user');
const Bench = require('../models/bench');

exports.cleanUpDatabaseUser = async function() {
  await Promise.all([
   
    await User.deleteMany()
    
 ]);

};

exports.cleanUpDatabaseBench = async function() {
  await Promise.all([
   
    await Bench.deleteMany()
    
 ]);

};