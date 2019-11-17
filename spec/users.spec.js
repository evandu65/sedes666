const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const { cleanUpDatabaseUser } = require('./utils');
const { loginUser } = require('./utils');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';
const authenticate = require('../middlewares/auth')

let auth = {};

beforeEach(cleanUpDatabaseUser);
//beforeEach(loginUser);



describe('POST /users', function () {


  it('should create a user',  async function () {
    const res = await supertest(app)
      .post('/users')
      .send({
        username: 'John Doe',
        password: '1234'
      })
      .expect(200)
      .expect('Content-Type', /json/);
    
    // Check that the response body is a JSON object with exactly the properties we expect.
    expect(res.body).to.be.an('object');
    expect(res.body._id).to.be.a('string');
    expect(res.body.username).to.equal('John Doe');
    expect(res.body).to.have.all.keys('_id', 'username', 'password', 'registrationDate', '__v');
  });
});



describe('GET /users/:id', function () {
 



  it('should retrieve one user', async function () {

    const user = await User.create({_id:"5db456bc5cfb8c3690a24e9a", username: 'John Doe', password:'1234' })

  const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
  const claims = { sub: user._id.toString(), exp: exp };
  const token = jwt.sign(claims, secretKey)

    
    const res = await supertest(app)
      .get('/users/5db456bc5cfb8c3690a24e9a')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)

  

    expect(res.body).to.be.an('object');
    expect(res.body._id).to.be.a('string');
    expect(res.body.username).to.equal('John Doe');
    expect(res.body).to.have.all.keys('_id', 'username', 'password',  'registrationDate', '__v');

  });
});

after(mongoose.disconnect);