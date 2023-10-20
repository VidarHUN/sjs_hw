const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {resolve} = require('path');

const css = resolve('views/style.css');

// In-memory data storage
// TODO: Replace with MongoDB
var chefList = require('./data.js').chefs;
var recipeList = require('./data.js').recipes;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static(css));

app.get('*/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(css);
});

// Chef routes and controller
const chefRouter = express.Router();

// POST /api/chefs
// Add a chef to the collection
// The user sends every information in the body
chefRouter.post('/', (req, res) => {
  const chef = req.body;
  chefList.push(chef);
  res.json(chef);
});

// GET /api/chefs
// Return all chefs from the collection
chefRouter.get('/', (req, res) => {
  let chefs = chefList;
  res.render('chefs', {chefs});
  // res.json(chefs);
});

// GET /api/chefs/:chefId
// Return only chef
// The user has to define the chef's name with an ID
chefRouter.get('/:chefId', (req, res) => {
  const chefId = parseInt(req.params.chefId);
  const chefData = chefList.find((chef) => chef.id === chefId);
  res.render('chef', {chefData});
  // res.json(chefData);
});

// PUT /api/chefs/:chefId
// Update a chef object in the collection
chefRouter.put(':chefId', (req, res) => {
  const chefId = req.params.chefId;
  const index = chefList.findIndex(obj => {
    return obj.id === chefId;
  });
  if (index !== -1) {
    chefList[index] = req.body;
  }
  res.json(chefList);
});

// DELETE /api/chefs/:chefId
// Delete chef from collection based on ID
chefRouter.delete(':chefId', (req, res) => {
  const chefId = req.params.chefId;
  chefs = chefList.filter(item => item.id !== chefId);
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
  const recipeObj = req.body;
  recipeLists.push(recipeObj);
  let recipes = recipeList;
  res.json(recipes);
});

// GET /api/recipes
// Return all recipes from collection
recipeRouter.get('/', (req, res) => {
  // res.json(recipes);
  const chefId = parseInt(req.query.chef);
  if (chefId) {
    const recipeData = recipeList.find((recipe) => recipe.chefId === chefId);
    // res.json(recipeData);
    // console.log(recipeData);
    res.render('food', {recipeData});
  } else {
    let recipes = recipeList;
    res.render('recipes', {recipes});
  }
});

// GET /api/recipes?chef=id
// Return recipes which are connected to a particular chef
// recipeRouter.get('/', (req, res) => {
//   console.log("stom");
//   const chef = req.query.chef;
//   const recipeData = recipes.filter((recipe) => recipe.chefId === chef);
//   res.json(recipeData);
//   // res.render('food', {recipeData});
// });

// GET /api/recipes/:recipeId
// Return only recipe
// The user has to define the recipe's name with an ID
recipeRouter.get('/:recipeId', (req, res) => {
  const recipeId = parseInt(req.params.recipeId);
  const recipeData = recipeList.find((recipe) => recipe.id === recipeId);
  res.render('food', {recipeData});
});


// PUT /api/recipes/:recipeId
// Update a recipe object in the collection
recipeRouter.put(':recipeId', (req, res) => {
  const recipeId = req.params.recipeId;
  const index = recipeList.findIndex(obj => {
    return obj.id === recipeId;
  });
  if (index !== -1) {
    recipeList[index] = req.body;
  }
  let recipes = recipeList;
  res.json(recipes);
});

// DELETE /api/recipes/:recipeId
// Delete recipe from collection based on ID
recipeRouter.delete(':recipeId', (req, res) => {
  const recipeId = req.params.recipeId;
  recipes = recipeList.filter(item => item.id !== recipeId);
  res.json(recipes);
});

app.use('/api/recipes', recipeRouter);

app.get('/api/add_recipes', (req, res) => {
  res.render('add_recipes');
});

app.get('/api/add_chefs', (req, res) => {
  res.render('add_chefs');
});

// Get recipes by chef
app.get('/api/chefs/:chefId/recipes', (req, res) => {
  const chefId = parseInt(req.params.chefId);
  const recipes = recipeList.filter((recipe) => recipe.chefId === chefId);
  res.render('recipes', {recipes});
  // res.json(chefRecipes);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
