//Mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
    maxlength: 50,
    validate:
    [{
      validator: validateUsernameUniqueness,
      message:'Username {VALUE} already exists'
    }],
  },
  password: {
    type : String,
    required: true,
    minlength: 3,
    maxlength:60,
  },
  registrationDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    totalVote: Number,
  }
}
);

function validateUsernameUniqueness(value) {
  return this.constructor.findOne().where('username').equals(value).exec().then((existingUser) => {
    return !existingUser || existingUser._id.equals(this._id);
  });
}

module.exports = mongoose.model('User', userSchema);