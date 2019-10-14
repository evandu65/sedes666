var mongoose = require('mongoose');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/sedes');

module.exports = app;
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
});
const benchSchema = new Schema({
  description: String,
  creationDate: { type: Date, default: Date.now  }, // Default value
  modifDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    backrest: Boolean,
    material: String,
    seats : BigInt,
    longitude : Float32Array,
    latitude : Float32Array,
    score : BigInt,
  }
});
const voteSchema = new Schema({
  type: Boolean,
  voteDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    userid : Int32Array,
  }
});