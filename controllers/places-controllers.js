const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');


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
		//userWithPlaces = await User.findById(userId).populate('places') is an alternative
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
		image: req.file.path,
		creator
	});

	//need to confirm if the creator we inputted exist
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError('Creating place failed1, please try again', 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed2, please try again.',
      500
    );
    return next(error);
  }
  res.status(201).json({ place: createdPlace });
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
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
	}

	if (!place) {
		const error = new HttpError('Could not find place for this id.',404);
		return next(error);
	}

	const imagePath = place.image;
	
	try {  
		const sess = await mongoose.startSession();
    sess.startTransaction();
		await place.remove({session: sess});
		//removes place from the user
		place.creator.places.pull(place);
		await place.creator.save({session: sess});
		await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
	}

	fs.unlink (imagePath, err => {
		console.log(err);
	});

	res.status(200).json({message: "Deleted place."});
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;