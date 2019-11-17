const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY || 'changeme';

const app = require('../app');
const { cleanUpDatabaseBench } = require('./utils');
const Bench = require('../models/bench');
const User = require('../models/user');

beforeEach(cleanUpDatabaseBench);

describe('POST /benches', function () {

  beforeEach(async function () {

    await Promise.all([
      User.create({_id:"5db6f7c758696c3c6c772c31", username: 'Jane Doe', password:'12344' })
    ])

  }),


  it('should create a bench', async function () {

    const user = await User.create({_id:"5db456bc5cfb8c3690a24e9a", username: 'John Doe', password:'1234' })

  const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
  const claims = { sub: user._id.toString(), exp: exp };
  const token = jwt.sign(claims, secretKey)

    const res = await supertest(app)
      .post('/benches')
      .set('Authorization', 'Bearer ' + token)
      .send({
        description: "c'est un joli banc qui surplombe le paysage valaisan",
        backrest: 0,
        material: "Metal",
        ergonomy: 4,
        seats: 5,
        image: "https://www.google.ch/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=2ahUKEwjyu__M6dflAhUOGewKHTHsA_MQjRx6BAgBEAQ&url=https%3A%2F%2Fwww.amazon.com%2FGDF-Studio-300496-Colonial-Sandblack%2Fdp%2FB0725D1VDL&psig=AOvVaw1cKGLGRnPFxIP4DukSsr37&ust=1573206645976252",
        location: {
          type: "Point",
          coordinates: [-73.856077, 40.848447]
        },
        userId:"5db6f7c758696c3c6c772c31"
      })
      .expect(200)
      .expect('Content-Type', /json/);
      

    // Check that the response body is a JSON object with exactly the properties we expect.
    expect(res.body).to.be.an('object');
    expect(res.body._id).to.be.a('string');
    expect(res.body.backrest).to.be.a('boolean');
    expect(res.body.ergonomy).to.be.a('number');
    expect(res.body.material).to.equal('Metal');
    expect(res.body.seats).to.be.a('number');
    expect(res.body.image).to.be.a('string');
    expect(res.body.location.type).to.equal('Point');
    expect(res.body.location.coordinates).to.be.a('array');
    expect(res.body.location.coordinates[0]).to.be.a('number');
    expect(res.body.location.coordinates[1]).to.be.a('number');
    expect(res.body).to.have.all.keys('_id', 'description', 'backrest', '__v', 'creationDate', 'ergonomy', 'image', 'location', 'material', 'modifDate', 'score', 'seats', 'userId');
  })
});


describe('GET /benches/:id', function () {
  beforeEach(async function () {

    await Promise.all([
      User.create({_id:"5db6f7c758696c3c6c772c31", username: 'Jane Doe', password:'12344' })
    ])

    // Create 2 benches before retrieving the list.
    await Promise.all([
      Bench.create({
        _id: "5db701c8888ba23334161c7b",
        description: "c'est un joli banc qui surplombe le paysage valaisan",
        backrest: 0,
        material: "Metal",
        ergonomy: 4,
        seats: 5,
        image: "https://www.google.ch/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=2ahUKEwjyu__M6dflAhUOGewKHTHsA_MQjRx6BAgBEAQ&url=https%3A%2F%2Fwww.amazon.com%2FGDF-Studio-300496-Colonial-Sandblack%2Fdp%2FB0725D1VDL&psig=AOvVaw1cKGLGRnPFxIP4DukSsr37&ust=1573206645976252",
        location: {
          type: "Point",
          coordinates: [-73.856077, 40.848447]
        },
        userId:"5db6f7c758696c3c6c772c31"
      })
    ]);
  });

  it('should retrieve one bench', async function () {
    const user = await User.create({_id:"5db456bc5cfb8c3690a24e9a", username: 'John Doe', password:'1234' })
  
    const exp = (new Date().getTime() + 7 * 24 * 3600 * 1000) / 1000;
    const claims = { sub: user._id.toString(), exp: exp };
    const token = jwt.sign(claims, secretKey)

    const res = await supertest(app)
      .get('/benches/5db701c8888ba23334161c7b')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)

    expect(res.body).to.be.an('object');
   
    expect(res.body._id).to.be.a('string');
    expect(res.body.backrest).to.be.a('boolean');
    expect(res.body.ergonomy).to.be.a('number');
    expect(res.body.material).to.equal('Metal');
    expect(res.body.seats).to.be.a('number');
    expect(res.body.image).to.be.a('string');
    expect(res.body.location.type).to.equal('Point');
    expect(res.body.location.coordinates).to.be.a('array');
    expect(res.body.location.coordinates[0]).to.be.a('number');
    expect(res.body.location.coordinates[1]).to.be.a('number');
    expect(res.body).to.have.all.keys('_id', 'description', 'backrest', '__v', 'creationDate', 'ergonomy', 'image', 'location', 'material', 'modifDate', 'score', 'seats', 'userId');

  });
});

after(mongoose.disconnect);