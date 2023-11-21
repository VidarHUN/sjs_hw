const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { resolve } = require('path');
const mongoose = require('mongoose');
const { Chef, Recipe } = require('./model.js');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Connection URL for your MongoDB server
const mongoDBUrl = 'mongodb://127.0.0.1:27017/XA5OZH';

// Connect to MongoDB using Mongoose
mongoose.connect(mongoDBUrl)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    Chef.createCollection();
    Recipe.createCollection();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '.png')
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { headers: {'Content-Type': 'image/*'} }));
app.set('view engine', 'ejs');

// Chef routes and controller
const chefRouter = express.Router();

// POST /api/chefs
// Add a chef to the collection
// The user sends every information in the body
chefRouter.post('/', upload.single('chefImage'), async (req, res) => {
  const obj = {
    name: req.body.name,
    description: req.body.description,
    chefImage: path.join('/uploads/' + req.file.filename)
  };
  try {
    const newChef = new Chef(obj);
    await newChef.save();
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the Chef.' })
  }
  res.render('add_chefs');
});

// GET /api/chefs
// Return all chefs from the collection
chefRouter.get('/', async (req, res) => {
  const chefs = await Chef.find();
  res.render('chefs', { chefs });
});

// GET /api/chefs/:chefId
// Return only chef
// The user has to define the chef's name with an ID
chefRouter.get('/:chefId', async (req, res) => {
  const chefId = req.params.chefId;
  const chef = await Chef.findById(chefId);

  if (!chef) {
    res.status(404).json('Chef document not found');
  } else {
    res.render('chef', { chef });
  }
});

// GET /api/chefs/update_chef/:chefId
// Update page of a chef
chefRouter.get('/update_chef/:chefId', async (req, res) => {
  const chefId = req.params.chefId;
  const chef = await Chef.findById(chefId);
  res.render('update_chef', { chef });
});

// POST /api/chefs/:chefId
// Update a chef object in the collection
chefRouter.post('/:chefId', upload.single('chefImage'), async (req, res) => {
  const chefId = req.params.chefId;
  const obj = {
    name: req.body.name,
    description: req.body.description,
  };
  if (req.file) {
    const chef = await Chef.findById(chefId);
    fs.unlink(chef.chefImage.slice(1), (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully');
      }
    });
    obj.chefImage = path.join('/uploads/' + req.file.filename);
  }
  try {
    const newChef = await Chef.findByIdAndUpdate(chefId, obj);
    await newChef.save();
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while update the Chef.' })
  }
  res.redirect(`/api/chefs/${chefId}`);
});

// DELETE /api/chefs/:chefId
// Delete chef from collection based on ID
chefRouter.delete('/:chefId', async (req, res) => {
  const chefId = req.params.chefId;

  try {
      // Perform the deletion in the database
      const chef = await Chef.findById(chefId);
      fs.unlink(chef.chefImage.slice(1), (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
      await Chef.findByIdAndDelete(chefId);
      res.status(200).json({ message: 'Chef deleted successfully' });;
    } catch (error) {
      console.error('Error deleting chef:', error.message);
      res.status(500).send('Internal Server Error');
    }
});

app.use('/api/chefs', chefRouter);

// Recipe routes and controller
const recipeRouter = express.Router();

// POST /api/recipes
// Add recipe to the collection
recipeRouter.post('/', upload.single('foodImage'),  async (req, res) => {
  const chef = await Chef.findOne({ name: req.body.chef }).exec();
  const obj = {
    title: req.body.title,
    description: req.body.description,
    ingredients: req.body.ingredients.split('\n'),
    instructions: req.body.instructions.split('\n'),
    chef: req.body.chef,
    chefId: chef._id,
    foodImage: path.join('/uploads/' + req.file.filename)
  };
  try {
    const newRecipe = new Recipe(obj);
    await newRecipe.save();
    res.status(201);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the Recipe.' })
  }
  res.render('add_recipes');
});

recipeRouter.get('/', async (req, res) => {
  const chefId = req.query.chefId;
  if (chefId) {
    // - /api/recipes/:
    // 	- GET /api/recipes?chefId=id - Receptek listázása séf szerint
    const recipes = await Recipe.find({ chefId: chefId }).exec();
    res.render('recipes', { recipes });
  } else {
    // GET /api/recipes
    // Return all recipes from collection
    const recipes = await Recipe.find();
    res.render('recipes', { recipes });
  }
});

// GET /api/recipes/:recipeId
// Return only recipe
// The user has to define the recipe's name with an ID
recipeRouter.get('/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;
  const recipe = await Recipe.findById(recipeId)

  if (!recipe) {
    res.status(404).json('Recipe document not found');
  } else {
    res.render('food', { recipe });
  }
});

// GET /api/recipes/update_recipe/:recipeId
// Update page of a recipe
recipeRouter.get('/update_recipe/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;
  const recipeData = await Recipe.findById(recipeId);
  const recipe = {
    title: recipeData.title,
    description: recipeData.description,
    ingredients: recipeData.ingredients.join("\n"),
    instructions: recipeData.instructions.join('\n'),
    chef: recipeData.chef,
    _id: recipeData._id
  }
  res.render('update_recipe', { recipe });
});

// POST /api/recipes/:recipeId
// Update a recipe object in the collection
recipeRouter.post('/:recipeId', upload.single('foodImage'), async (req, res) => {
  const recipeId = req.params.recipeId;
  try {
    const chef = await Chef.findOne({ name: req.body.chef }).exec();
    const obj = {
      title: req.body.title,
      description: req.body.description,
      ingredients: req.body.ingredients.split('\n'),
      instructions: req.body.instructions.split('\n'),
      chef: req.body.chef,
      chefId: chef._id
    };

    if (req.file) {
      const recipe = await Recipe.findById(recipeId);
      fs.unlink(recipe.foodImage.slice(1), (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
      obj.foodImage = path.join('/uploads/' + req.file.filename);
    }

    await Recipe.findByIdAndUpdate(recipeId, obj);
    res.status(201).redirect(`/api/recipes/${recipeId}`);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the Recipe.' });
  }
});

// DELETE /api/recipes/:recipeId
// Delete recipe from collection based on ID
recipeRouter.delete('/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
      // Perform the deletion in the database
      const recipe = await Recipe.findById(recipeId);
      fs.unlink(recipe.foodImage.slice(1), (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully');
        }
      });
      await Recipe.findByIdAndDelete(recipeId);
      res.status(200).json({ message: 'Recipe deleted successfully' });;
    } catch (error) {
      console.error('Error deleting chef:', error.message);
      res.status(500).send('Internal Server Error');
    }
});

app.use('/api/recipes', recipeRouter);

app.get('/api/add_recipes', (req, res) => {
  res.render('add_recipes');
});

app.get('/api/add_chefs', (req, res) => {
  res.render('add_chefs');
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;