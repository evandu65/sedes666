const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const voteSchema = new Schema({
    type: Boolean,
    // Default value
    voteDate: {
      type: Date,
      default: Date.now 
    }, 
    userId: {
      type: Schema.Types.ObjectId,
      required:true,
      validate: {
        // Validate that the userId is a valid ObjectId
        // and references an existing user
        validator: validateUserId,
        message: function(props) { return props.reason.message; }
      }
    },
    benchId: {
      type: Schema.Types.ObjectId,
      required:true,
      validate: {
        // Validate that the benchId is a valid ObjectId
        // and references an existing bench
        validator: validateBenchId,
        message: function(props) { return props.reason.message; }
      }
    }
  });

  function validateUserId(value) {
    console.log('Validating user ID');
    return new Promise((resolve, reject) => {
  
      if (!ObjectId.isValid(value)) {
        throw new Error(`validateUserId is not a valid user reference`);
      }
  
      mongoose.model('User').findOne({ _id: ObjectId(value) }).exec()
        .then((user) => {
          if (!user) {
            throw new Error(`validateUserId does not reference a user that exists`);
          } else {
            resolve(true);
          }
        })
        .catch(e => { reject(e) });
    })
  
  
  };

  function validateBenchId(value) {
    return new Promise((resolve, reject) => {
  
      if (!ObjectId.isValid(value)) {
        throw new Error(`validateBenchId is not a valid bench reference`);
      }
  
      mongoose.model('Bench').findOne({ _id: ObjectId(value) }).exec()
        .then((bench) => {
          if (!bench) {
            throw new Error(`validateBenchId does not reference a bench that exists`);
          } else {
            resolve(true);
          }
        })
        .catch(e => { reject(e) });
    }) 
  }

   module.exports = mongoose.model('Vote', voteSchema);

