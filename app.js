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
);
const benchSchema = new Schema({
  description: String,
  creationDate: { type: Date, default: Date.now  }, // Default value
  modifDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    backrest: Boolean,
    material: String,
    seats : Number,
    longitude : Number,
    latitude : Number,
    score : Number,
  }
});
const voteSchema = new Schema({
  type: Boolean,
  voteDate: { type: Date, default: Date.now  }, // Default value
  meta: { // Nested document
    userid : Number,
  }
});
/////////////////////////////////ROUTER/////////////////////////////////

///////////////USER///////////////
/* POST new user */
router.post('/users', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);
  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedUser);
  });
});

///////////////BENCH///////////////
/* POST new bench */
router.post('/benches', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newBench = new Bench(req.body);
  // Save that document
  newBench.save(function(err, savedBench) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedBench);
  });
});

///////////////VOTE///////////////
/* POST new vote */
router.post('/votes', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newVote = new Vote(req.body);
  // Save that document
  newVote.save(function(err, savedVote) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedVote);
  });
});

mongoose.model('User', userSchema);
mongoose.model('Bench', benchSchema);
mongoose.model('Vote', voteSchema);
