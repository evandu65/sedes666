//Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type : String,
    required: true
  },
  registrationDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    totalVote: Number,
  }
}
);

module.exports = mongoose.model('User', userSchema);