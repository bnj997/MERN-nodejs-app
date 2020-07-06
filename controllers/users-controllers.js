const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');


function getUsers(req, res, next) {
  res.json({ users: DUMMY_USERS });
}

function signup(req, res, next) {
	
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		throw new HttpError("Invalid inputs passed, please check your data.", 422);
	}


	const { name, email, password } = req.body;

	const hasUser = DUMMY_USERS.find(u => u.email === email);
	if (hasUser) {
		throw new HttpError('Could not create user, email already exists.', 422);
	}
	const createdUser = {
		id: uuidv4(),
		name: name,
		email: email,
		password: password
	};

	DUMMY_USERS.push(createdUser);

	res.status(201).json({user: createdUser});
};



function login(req, res, next) {
	const { email, password } = req.body;
	const identifiedUser = DUMMY_USERS.find(u => u.email === email);
	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError('Could not identify user, please check credentials.', 401)
	}
	res.json({message: "Logged in!"});
}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;