const User = require('../models/user');

exports.cleanUpDatabase = async function() {
    console.log("test1")
  //await Promise.all([
   this.timeout=10000;
    await User.deleteMany()
 // ]);
  console.log("test1")

};