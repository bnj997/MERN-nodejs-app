const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error')
const app = express();


//This will parse any incoming request body and extract any json data from there and convert to regular javascipt object/array
//Will then call "next" automatically so can reach the next middleware line (app.use('/api/places', placesRoutes)) and also add the json data there
app.use(bodyParser.json());


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
  //check if response has already been sent
  if (res.headerSent) {
    //wont send a response on our own
    return next(error);
  }
  res.status(error.code || 500)
  //every error i send back from api should have message property
  res.json({message: error.message || 'An unknown error occured!'})
});

app.listen(5000);