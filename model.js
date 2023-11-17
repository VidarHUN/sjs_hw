const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema({
    name: String,
    description: String,
    chefImage: String
});

const recipeSchema = new mongoose.Schema({
    title: String,
    description: String,
    ingredients: [String],
    instructions: [String],
    chefId: String,
    chef: String,
    foodImage: String
});

exports.Chef = mongoose.model('Chef', chefSchema);
exports.Recipe = mongoose.model('Recipe', recipeSchema);