const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

//Name of new collection is "places"
const userSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		minlength: 6,
		required: true
	},
	image: {
		type: String,
		required: true,
	},
	places: [{                        //Put array here '[]' as users can have multiple places
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'Place'
	}]
});


userSchema.plugin(uniqueValidator);


module.exports = mongoose.model('User', userSchema);