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

chefRouter.post('/', (req, res) => {
  const chef = req.body;
  chefs.push(chef);
  res.json(chef);
});

chefRouter.get('/', (req, res) => {
  res.json(chefs);
});

chefRouter.get(':chefName', (req, res) => {
  const chefName = req.params.chefName;
  const chefData = chefs.filter((chef) => chef.name === chefName);
  res.json(chefData)
});

app.use('/api/chefs', chefRouter);

// Recipe routes and controller
const recipeRouter = express.Router();

recipeRouter.post('/', (req, res) => {
  const recipe = req.body;
  recipes.push(recipe);
  res.json(recipe);
});

recipeRouter.get('/', (req, res) => {
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
