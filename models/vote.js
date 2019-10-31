const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
const voteSchema = new Schema({
    type: Boolean,
    voteDate: { type: Date, default: Date.now  }, // Default value
    userId: {
      type: ObjectId,
      required:true,
      validate: {
        // Validate that the userId is a valid ObjectId
        // and references an existing person
        validator: validateUserId,
        message: function(props) { return props.reason.message; }
      }
    }
    // Ajouter validation
  });

  function validateUserId(value) {
    return new Promise((resolve, reject) => {
  
      if (!ObjectId.isValid(value)) {
        throw new Error(`validateUserId is not a valid user reference`);
      }
  
      mongoose.model('User').findOne({ _id: ObjectId(value) }).exec()
        .then((person) => {
          if (!person) {
            throw new Error(`validateUserId does not reference a user that exists`);
          } else {
            resolve(true);
          }
        })
        .catch(e => { reject(e) });
    })
  
  
  }

   module.exports = mongoose.model('Vote', voteSchema);

