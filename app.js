const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory data storage
// TODO: Replace with MongoDB
let chefs = [];
let recipes = [];

// Chef routes and controller
const chefRouter = express.Router();

// POST /api/chefs
// Add a chef to the collection
// The user sends every information in the body
chefRouter.post('/', (req, res) => {
  const chef = req.body;
  chefs.push(chef);
  res.json(chef);
});

// GET /api/chefs
// Return all chefs from the collection
chefRouter.get('/', (req, res) => {
  res.json(chefs);
});

// GET /api/chefs/:chefID
// Return only chef
// The user has to define the chef's name with an ID
chefRouter.get(':chefID', (req, res) => {
  const chefID = req.params.chefID;
  const chefData = chefs.filter((chef) => chef.id === chefID);
  res.json(chefData);
});

// PUT /api/chefs/:chefID
// Update a chef object in the collection
chefRouter.put(':chefID', (req, res) => {
  const chefID = req.params.chefID;
  const index = chefs.findIndex(obj => {
    return obj.id === chefID;
  });
  if (index !== -1) {
    chefs[index] = req.body;
  }
  res.json(chefs);
});

// DELETE /api/chefs/:chefID
// Delete chef from collection based on ID
chefRouter.delete(':chefID', (req, res) => {
  const chefID = req.params.chefID;
  chefs = chefs.filter(item => item.id !== chefID);
  res.json(chefs);
});

app.use('/api/chefs', chefRouter);

// Recipe routes and controller
const recipeRouter = express.Router();

// - /api/recipes/:
// 	- GET /api/recipes?chef=id - Receptek listázása séf szerint

// POST /api/recipes
// Add recipe to the collection
recipeRouter.post('/', (req, res) => {
  const recipe = req.body;
  recipes.push(recipe);
  res.json(recipe);
});

// GET /api/recipes
// Return all recipes from collection
recipeRouter.get('/', (req, res) => {
  res.json(recipes);
});

// GET /api/recipes?chef=id
// Return recipes which are connected to a particular chef
chefRouter.get('/', (req, res) => {
  const chef = req.query.chef;
  const recipeData = recipes.filter((recipe) => recipe.chef === chef);
  res.json(recipeData);
});

// GET /api/recipes/:recipeID
// Return only recipe
// The user has to define the recipe's name with an ID
chefRouter.get(':recipeID', (req, res) => {
  const recipeID = req.params.recipeID;
  const recipeData = recipes.filter((recipe) => recipe.id === recipeID);
  res.json(recipeData);
});


// PUT /api/recipes/:recipeID
// Update a recipe object in the collection
chefRouter.put(':recipeID', (req, res) => {
  const recipeID = req.params.recipeID;
  const index = recipes.findIndex(obj => {
    return obj.id === recipeID;
  });
  if (index !== -1) {
    recipes[index] = req.body;
  }
  res.json(recipes);
});

// DELETE /api/recipes/:recipeID
// Delete recipe from collection based on ID
chefRouter.delete(':recipeID', (req, res) => {
  const recipeID = req.params.recipeID;
  recipes = recipes.filter(item => item.id !== recipeID);
  res.json(recipes);
});

app.use('/api/recipes', recipeRouter);

// Get recipes by chef
app.get('/api/chefs/:chefName/recipes', (req, res) => {
  const chefName = req.params.chefName;
  const chefRecipes = recipes.filter((recipe) => recipe.chef === chefName);
  res.json(chefRecipes);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
