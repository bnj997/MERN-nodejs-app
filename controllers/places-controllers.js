const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'The title',
		description: 'The place',
		location: {
			lat: 40.7484405,
			lng: -73.9878584
		},
		address: '20 W 34th St, New York, NY 10001, United States',
		creator: 'u1'
	}
];


async function getPlaceById(req, res, next) {
	//This information can be retrieved because it is part of the url ('/:pid'). Check places-routes.js for the route
	const placeId = req.params.pid

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		//If GET request leads to particular problem like missing info,. run this error block
		const error = new HttpError('Something went wrong, could not find a place.', 500);
		return next(error);
	}

	//If request is fine but dont just have placesId in database, then this error thrown
	if (!place) {
		const error = new HttpError('Could not find place for provided id.', 404);
		return next(error);
	}

	//Convert place object to normal javascript object and remove the underscore in id
	res.json({ place: place.toObject( {getters: true}) });
}


async function getPlacesByUserId(req, res, next) {
	//This information can be retrieved because it is part of the url ('/:uid'). Check places-routes.js for the route
	const userId = req.params.uid

	let places;
	try {
		places = await Place.find({creator: userId});
	} catch (err) {
		//If GET request leads to particular problem like missing info,. run this error block
		const error = new HttpError('Fetching places failed, please try again later.', 500);
		return next(error);
	}

	if (!places || places.length === 0) {
		const error = new HttpError('Could not find places for the provided user id.', 404);
		return next(error);
	}

	//Convert all places object to normal javascript object and remove the underscore in id
	//places.map ensures the toObject function applies to all places that correspond to particular id
	res.json({places: places.map(place => place.toObject({getters: true})) });
}


//async since will be communicating with another server
async function createPlace(req, res, next) {
	//Works with the check middleware you put in places-routs.js
	//returns any errors you get
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors);
		//with async, cant "throw" errors not must use next
		return next(
			new HttpError('Invalid inputs passed, please check your data.', 422)
		);
	}

	//similar to doing "const title= req.body.title" but destructring makes it easy to do it all in one line
	//dont include coordinates as will be generated automatically in next few lines
	const {title, description, address, creator} = req.body;


	//Need to test if coordinates actually relate to real location
	//This uses another server so need to try and wait for other server to process
	let coordinates;
	try {
		//converting address to coordinates
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}


	// creates new place based on schema and saves it
	const createdPlace = new Place({
		title,
		description,
		address,
		location: coordinates,
		image: 'data:image/jpeg;base64,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',
		creator
	});

	try {
		await	createdPlace.save();
	} catch (err) {
		const error = new HttpError('Creating place failed, please try again.',500);
		return next(error);
	}
	res.status(201).json({place: createdPlace});
};



async function updatePlace(req, res, next) {
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError('Invalid inputs passed, please check your data.', 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};


async function deletePlace(req, res, next) {
	const placeId = req.params.pid;
	
	let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
	}
	
	try {
    await place.remove();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

	res.status(200).json({message: "Deleted place."});
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;