const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const benchSchema = new Schema({
    description: String,
    creationDate: { type: Date, default: Date.now  }, // Default value
    modifDate: { type: Date, default: Date.now  }, // Default value
    score  :{ type : Number, default : 0}, // Default score value
    meta: { // Nested document
      backrest: Boolean,
      material: String,
      seats : Number,
      longitude : Number,
      latitude : Number
    }
  });

  module.exports = mongoose.model('Bench', benchSchema);