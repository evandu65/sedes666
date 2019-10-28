const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const benchSchema = new Schema({
    description: String,
    creationDate: { type: Date, default: Date.now  }, // Default value
    modifDate: { type: Date, default: Date.now  }, // Default value
    score  :{ type : Number, default : 0}, // Default score value
    backrest: Boolean,
    material: ['Wood','Metal','Stone','Marble','Plastic'],
    ergonomy : ['1','2','3','4','5'],
    seats : Number,
    image : String,
    location : {
      longitude : Number,
      latitude : Number
    }
  });


  module.exports = mongoose.model('Bench', benchSchema);