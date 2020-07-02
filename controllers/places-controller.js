const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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


function getPlaceByUserId(req, res, next) {
	//This information can be retrieved because it is part of the url ('/:uid'). Check places-routes.js for the route
	const userId = req.params.uid
	const place = DUMMY_PLACES.find(p => {
			return p.creator === userId
	})

	if (!place) {
		return next(
			new HttpError('Could not find a place for the provided user id.', 404)
		);
	}

	res.json({place: place});
}


function createPlace(req, res, next) {
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



exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
