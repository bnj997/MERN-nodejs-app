const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

//express will only forward requests to placesRoutes if their path starts with /api/places
//if request path is /api/places, will trigger get method in place-routes
app.use('/api/places', placesRoutes);

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