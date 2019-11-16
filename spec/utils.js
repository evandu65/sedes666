const User = require('../models/user');
const Bench = require('../models/bench');
const supertest = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

exports.cleanUpDatabaseUser = async function() {
  await Promise.all([
   
    await User.deleteMany()
    
 ]);

};

exports.cleanUpDatabaseBench = async function() {
  await Promise.all([
   
    await Bench.deleteMany()
    
 ]);

};
