const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const { cleanUpDatabase } = require('./utils');
const User = require('../models/user');

beforeEach(cleanUpDatabase);

describe('POST /users', function () {


  it('should create a user', async function () {
    console.log("tes1")
    const res = await supertest(app)
      .post('/users')
      .send({
        username: 'John Doe',
        password: '1234'
      })
      .expect(200)
      .expect('Content-Type', /json/);
      console.log("test2")

    // Check that the response body is a JSON object with exactly the properties we expect.
    expect(res.body).to.be.an('object');
    expect(res.body._id).to.be.a('string');
    expect(res.body.username).to.equal('John Doe');
    expect(res.body).to.have.all.keys('_id', 'username', 'password', 'registrationDate', '__v');
  });
});

describe('GET /users', function () {
  beforeEach(async function () {
    // Create 2 users before retrieving the list.
    await Promise.all([
      User.create({ username: 'John Doe', password:'12344' }),
      User.create({ username: 'Jane Doe', password:'123456' })
    ]);
  });

  it('should retrieve the list of users', async function () {
    const res = await supertest(app)
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(2);

    expect(res.body[0]).to.be.an('object');
    expect(res.body[0]._id).to.be.a('string');
    expect(res.body[0].username).to.equal('Jane Doe');
    expect(res.body[0]).to.have.all.keys('_id', 'username', 'password',  'registrationDate', '__v');

    expect(res.body[1]).to.be.an('object');
    expect(res.body[1]._id).to.be.a('string');
    expect(res.body[1].username).to.equal('John Doe');
    expect(res.body[1]).to.have.all.keys('_id', 'username', 'password',  'registrationDate', '__v');

  });
});

after(mongoose.disconnect);