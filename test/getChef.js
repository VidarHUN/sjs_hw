const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Chef = require('../model').Chef;
const mongoose = require('mongoose');

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/chefs/:chefId', () => {
  let createdChef;

  before(async () => {
    // Create a new Chef record before the test
    const newChef = new Chef({
      name: 'Test Chef',
      description: 'Description',
      chefImage: '/path/to/image'
    });

    createdChef = await newChef.save();
  });

  after(async () => {
    // Delete the created Chef record after the test
    if (createdChef) {
      await Chef.findByIdAndDelete(createdChef._id);
    }
  });

  it('should return the chef with the provided ID', async () => {
    const response = await chai
      .request(app)
      .get(`/api/chefs/${createdChef._id}`);

    expect(response).to.have.status(200);
    expect(response).to.be.html;
  });

  it('should return 404 for a non-existent chef ID', async () => {
    const nonExistentChefId = new mongoose.Types.ObjectId();
    const response = await chai
      .request(app)
      .get(`/api/chefs/${nonExistentChefId}`);

    expect(response).to.have.status(404);
  });
});
