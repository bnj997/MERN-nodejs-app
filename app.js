const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error')
const app = express();


//This will parse any incoming request body and extract any json data from there and convert to regular javascipt object/array
//Will then call "next" automatically so can reach the next middleware line (app.use('/api/places', placesRoutes)) and also add the json data there
app.use(bodyParser.json());

//Deals with delivering images to the front end
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

//Ensures that when we send response, it has these headers attached
app.use((req, res, next) => {
  //Controls which domains have access
  res.setHeader('Access-Control-Allow-Origin', '*')
  //Specifies which headers these requests sent by browsers may have
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  //Controls which methods may be used by front end
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  next();
});


//express will only forward requests to placesRoutes if their path starts with /api/places
//if request path is /api/places, will trigger get method in place-routes
app.use('/api/places', placesRoutes);

app.use('/api/users', usersRoutes);


//Only runs if we didnt send a response to one of our routes before
//This is because if we did send a response, we dont call "next()", we just send a response and hence no other middleware function is reached
//This middleware is only reached if there is some request which didnt get a response before, and thats only if the request is a request we dont want to handle
app.use(function(req, res, next) {
  const error = new HttpError('Could not find this route.', 404);
  return next(error)
})


//Only executed on requests that have error attached to it
//Will execute any middleware above if it yields an error
app.use(function(error, req, res, next){
  //checks if a file was wanted to be uploaded and if so, it will be deleted
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(err);
    });
  }

  //check if response has already been sent
  if (res.headerSent) {
    //wont send a response on our own
    return next(error);
  }
  res.status(error.code || 500)
  //every error i send back from api should have message property
  res.json({message: error.message || 'An unknown error occured!'})
});

//"places" is the name of the db
mongoose
  .connect('mongodb+srv://bnj997:Victoria2000@cluster0.ydtcj.mongodb.net/places?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true})
  .then(() => {
    app.listen(5000);
  }) 
  .catch(() => {
    console.log(err);
  });
