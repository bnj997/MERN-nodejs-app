const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');


router.get('/:pid', placesControllers.getPlaceById);

//Searching http://localhost:5000/api/places/user does not yield an error. 
//This is because the "user" part of http://localhost:5000/api/places/user is taken as a placeholder for '/:pid' (look at code segment above)
//Order of these routers are, therefore, important. the "user" is considered param for the first code segment (router.get('/:pid', placesControllers.getPlaceById);) and so this code block wont run.
router.get('/user/:uid', placesControllers.getPlacesByUserId );

//putting this code here means the first two middleware can run since its not dependamt on valid token
//CheckAuth here ensures that the post, patch and delete middlewares only work if the checkauth is successfuk.
router.use(checkAuth);


//Any POST requests that targets '/api/places' route (look at app.js) will automatically reach this post('/) route
//check middlewear is used to ensure that the title in request is not empty
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);


router.patch(
	'/:pid', 
	[
		check('title')
			.not()
			.isEmpty(),
		check('description')
			.isLength({min: 5})
	],
	placesControllers.updatePlace 
);


router.delete('/:pid', placesControllers.deletePlace ); 


module.exports = router;


