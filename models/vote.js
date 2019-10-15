const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voteSchema = new Schema({
    type: Boolean,
    voteDate: { type: Date, default: Date.now  }, // Default value
    meta: { // Nested document
      userid : Number,
    }
  });

  mongoose.model('Vote', voteSchema);