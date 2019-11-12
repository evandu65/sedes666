const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const { cleanUpDatabaseUser } = require('./utils');
const User = require('../models/user');

beforeEach(cleanUpDatabaseUser);

describe('POST /users', function () {


  it('should create a user', async function () {
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
  beforeEach(async function () {
    // Create 2 users before retrieving the list.
    await Promise.all([
      User.create({_id:"5db456bc5cfb8c3690a24e9a", username: 'John Doe', password:'12344' }),
    ]);
  });

  it('should retrieve one user', async function () {
    const res = await supertest(app)
      .get('/users/5db456bc5cfb8c3690a24e9a')
      .expect(200)
      .expect('Content-Type', /json/)

      console.log(res.body)

    expect(res.body).to.be.an('object');
    expect(res.body._id).to.be.a('string');
    expect(res.body.username).to.equal('John Doe');
    expect(res.body).to.have.all.keys('_id', 'username', 'password',  'registrationDate', '__v');

  });
});

after(mongoose.disconnect);