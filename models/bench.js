const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const integerValidator = require('mongoose-integer');

const benchSchema = new Schema({
    userId : String,
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
        type: {default : 'Point'},
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


  module.exports = mongoose.model('Bench', benchSchema);