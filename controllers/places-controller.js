const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
	{
		id: "p1",
		title: "The title",
		description: "The place",
		imageURL: "https://media-exp1.licdn.com/dms/image/C4E03AQGFl-WcfVNaKw/profile-displayphoto-shrink_200_200/0?e=1595462400&v=beta&t=72jo394Yu130e4xplsWmA78aMGC8zrm_F0hWDHPeReg",
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
		imageURL: "https://media-exp1.licdn.com/dms/image/C4E03AQGFl-WcfVNaKw/profile-displayphoto-shrink_200_200/0?e=1595462400&v=beta&t=72jo394Yu130e4xplsWmA78aMGC8zrm_F0hWDHPeReg",
		address: "20 W 34th St, New York, NY 10001, United States",
		location: {
			lat: 40.7484405,
			lng: -73.9878584
		},
		creator: 'u2'
	}
]


function getPlaceById(req, res, next) {
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

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;