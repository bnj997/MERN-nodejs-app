const express = require('express');
const router = express.Router();

const placesControllers = require('../controllers/places-controller');




router.get('/:pid', placesControllers.getPlaceById);

//Searching http://localhost:5000/api/places/user does not yield an error. 
//This is because the "user" part of http://localhost:5000/api/places/user is taken as a placeholder for '/:pid' (look at code segment above)
//Order of these routers are, therefore, important. the "user" is considered param for the first code segment and so this code block wont run.
router.get('/user/:uid', placesControllers.getPlaceByUserId );

module.exports = router;