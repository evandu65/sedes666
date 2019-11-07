const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const integerValidator = require('mongoose-integer');


const benchSchema = new Schema({
    description: String,
    creationDate: { type: Date, default: Date.now  }, // Default value
    modifDate: { type: Date, default: Date.now  }, // Default value
    score  :{ type : Number, default : 0}, // Default score value
    backrest: Boolean,
    material: { type : String, enumm : ['Wood','Metal','Stone','Marble','Plastic']},
    ergonomy : { type : Number, min: 0, max:5, integer: true},
    seats : Number,
    image : String,
    location : {
      longitude : Number,
      latitude : Number
    }
  });


  module.exports = mongoose.model('Bench', benchSchema);