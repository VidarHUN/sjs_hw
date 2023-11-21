const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Recipe = require('../model').Recipe;
const mongoose = require('mongoose');

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/recipes/:recipeId', () => {
  let createdRecipe;

  before(async () => {
    // Create a new Recipe record before the test
    const newRecipe = new Recipe({
        title: 'Recipe',
        description: 'Description',
        ingredients: ['Ing 1', 'Ing 2'],
        instructions: ['Ins 1', 'Ins 2'],
        chefId: 'id',
        chef: 'chef',
        foodImage: 'path/to/image'
    });

    createdRecipe = await newRecipe.save();
  });

  after(async () => {
    // Delete the created Recipe record after the test
    if (createdRecipe) {
      await Recipe.findByIdAndDelete(createdRecipe._id);
    }
  });

  it('should return the recipe with the provided ID', async () => {
    const response = await chai
      .request(app)
      .get(`/api/recipes/${createdRecipe._id}`);

    expect(response).to.have.status(200);
    expect(response).to.be.html;
  });

  it('should return 404 for a non-existent recipe ID', async () => {
    const nonExistentrecipeId = new mongoose.Types.ObjectId();
    const response = await chai
      .request(app)
      .get(`/api/recipes/${nonExistentrecipeId}`);

    expect(response).to.have.status(404);
  });
});
