const express = require('express');
const { check } = require('express-validator');
const router = express.Router();

const placesControllers = require('../controllers/places-controllers');


router.get('/:pid', placesControllers.getPlaceById);

//Searching http://localhost:5000/api/places/user does not yield an error. 
//This is because the "user" part of http://localhost:5000/api/places/user is taken as a placeholder for '/:pid' (look at code segment above)
//Order of these routers are, therefore, important. the "user" is considered param for the first code segment and so this code block wont run.
router.get('/user/:uid', placesControllers.getPlacesByUserId );

//Any POST requests that targets '/api/places' route (look at app.js) will automatically reach this post('/) route
//check middlewear is used to ensure that the title in request is not empty
router.post(
  '/',
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
			.isEmpty,
		check('description')
			.isLength({min: 5})
	],
	placesControllers.updatePlace 
);


router.delete('/:pid', placesControllers.deletePlace ); 


module.exports = router;




// const express = require('express');
// const { check } = require('express-validator');

// const placesControllers = require('../controllers/places-controllers');

// const router = express.Router();

// router.get('/:pid', placesControllers.getPlaceById);

// router.get('/user/:uid', placesControllers.getPlacesByUserId);

// router.post(
//   '/',
//   [
//     check('title')
//       .not()
//       .isEmpty(),
//     check('description').isLength({ min: 5 }),
//     check('address')
//       .not()
//       .isEmpty()
//   ],
//   placesControllers.createPlace
// );

// router.patch(
//   '/:pid',
//   [
//     check('title')
//       .not()
//       .isEmpty(),
//     check('description').isLength({ min: 5 })
//   ],
//   placesControllers.updatePlace
// );

// router.delete('/:pid', placesControllers.deletePlace);

// module.exports = router;
