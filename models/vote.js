const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
const voteSchema = new Schema({
    type: Boolean,
    voteDate: { type: Date, default: Date.now  }, // Default value
    userid : ObjectId,
    
    // Ajouter validation
  });
   module.exports = mongoose.model('Vote', voteSchema);