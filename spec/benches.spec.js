const { expect } = require('chai');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const { cleanUpDatabase } = require('./utils');
const Bench = require('../models/bench');

beforeEach(cleanUpDatabase);

describe('POST /benches', function () {


  it('should create a bench', async function () {
    const res = await supertest(app)
      .post('/benches')
      .send({
        description: "c'est un joli banc qui surplombe le paysage valaisan",
        backrest: 0,
        material: "Metal",
        ergonomy : 4,
        seats : 5,
        image : "https://www.google.ch/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&ved=2ahUKEwjyu__M6dflAhUOGewKHTHsA_MQjRx6BAgBEAQ&url=https%3A%2F%2Fwww.amazon.com%2FGDF-Studio-300496-Colonial-Sandblack%2Fdp%2FB0725D1VDL&psig=AOvVaw1cKGLGRnPFxIP4DukSsr37&ust=1573206645976252",
        location : {
          longitude : 46.7833,
          latitude : 6.65
        }
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
    expect(res.body.material).to.equal('Metal');
    expect(res.body).to.have.all.keys('_id', 'description', 'backrest', '__v', 'creationDate', 'ergonomy', 'image', 'location', 'material', 'modifDate','score', 'seats');
  });
});

after(mongoose.disconnect);