const { v4: uuidv4 } = require('uuid');
const { validationResult } = require("express-validator")
const HttpError = require('../models/http-error');

let DUMMY_PLACES = [
	{
		id: "p1",
		title: "The title",
		description: "The place",
		address: "20 W 34th St, New York, NY 10001, United States",
		location: {
			lat: 40.7484405,
			lng: -73.9878584
		},
		creator: 'u1'
	},
	{
		id: "p2",
		title: "The title2",
		description: "The place2",
		address: "20 W 34th St, New York, NY 10001, United States",
		location: {
			lat: 40.7484405,
			lng: -73.9878584
		},
		creator: 'u2'
	}
]


function getPlaceById(req, res, next) {
	//This information can be retrieved because it is part of the url ('/:pid'). Check places-routes.js for the route
	const placeId = req.params.pid
	const place = DUMMY_PLACES.find(p => {
			return p.id === placeId
	})

	if (!place) {
			return next(
			new HttpError('Could not find a place for the provided id.', 404)
			) 
	}
	res.json({place: place});
}


function getPlacesByUserId(req, res, next) {
	//This information can be retrieved because it is part of the url ('/:uid'). Check places-routes.js for the route
	const userId = req.params.uid
	const places = DUMMY_PLACES.filter(p => {
			return p.creator === userId
	})

	if (!places || places.length === 0) {
		return next(
			new HttpError('Could not find places for the provided user id.', 404)
		);
	}

	res.json({places: places});
}


function createPlace(req, res, next) {
	//Works with the check middleware you put in places-routs.js
	//returns any errors you get
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors);
		throw new HttpsError("Invalid inputs passed, please check your data.", 422);
	}

	//similar to doing "const title= req.body.title" but destructring makes it easy to do it all in one line
	const {title, description, coordinates, address, creator} = req.body;

	const createdPlace = {
		id: uuidv4(),
		title: title,
		description: description,
		location: coordinates,
		address: address,
		creator: creator
	};

	DUMMY_PLACES.push(createdPlace);
	res.status(201).json({place: createdPlace});
};

function updatePlace(req, res, next) {
	const {title, description} = req.body;
	const placeId = req.params.pid;
	//Create copy of the old object you want to update
	const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId) };
	//Find index of place we want to update
	const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

	//Update the copy object with correct info
	updatedPlace.title = title;
	updatedPlace.description = description;

	//Update actual array with the new updated copy
	DUMMY_PLACES[placeIndex] = updatedPlace;
	res.status(200).json({place: updatedPlace});
};

function deletePlace(req, res, next) {
	const placeId = req.params.pid;
	DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId );
	res.status(200).json({message: "Deleted place."});
};



exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
