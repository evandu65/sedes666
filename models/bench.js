const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const integerValidator = require('mongoose-integer');
const ObjectId = mongoose.Types.ObjectId;

const benchSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required:true,
    validate: {
      // Validate that the userId is a valid ObjectId
      // and references an existing person
      validator: validateUserId,
      message: function(props) { return props.reason.message; }
    }
  },
    description: String,
    creationDate: { type: Date, default: Date.now  }, // Default value
    modifDate: { type: Date, default: Date.now  }, // Default value
    score  :{ type : Number, default : 0}, // Default score value
    backrest: Boolean,
    material: { type : String, enumm : ['Wood','Metal','Stone','Marble','Plastic']},
    ergonomy : { type : Number, min: 0, max:5, integer: true},
    seats : Number,
    image : String,
    location: {
      type: {
        type: String,
        required: true,
        enum: [ 'Point' ]
      },
      coordinates: {
        type: [ Number ],
        required: true,
        validate: {
          validator: validateGeoJsonCoordinates,
          message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
        }
      }
    }
  });

  function validateGeoJsonCoordinates(value) {
    return Array.isArray(value) && value.length >= 2 && value.length <= 3 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
  }

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


  module.exports = mongoose.model('Bench', benchSchema);