const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

function errorHandler(message, statusCode) {
	const error = new Error(message);
	error.statusCode = statusCode;
	throw error;
}

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		const error = new Error('Validaion failed');
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const email = req.body.email;
	const password = req.body.password;
	const name = req.body.name;

	bcrypt
	.hash(password, 12)
	.then(hashedPw => {
		const user = new User({
			name: name,
			email: email,
			password: hashedPw
		});
		return user.save();
	})
	.then(user => {
		res.status(201).json({ "message": "user signed up successfully", userId: user._id  });
	})
	.catch(err => {
		next(err);
	})
}

exports.login = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	let loadedUser;
	User
	.findOne({email:email})
	.then(userDoc => {
		if(!userDoc) {
			return errorHandler("no email found", 401);
		}
		loadedUser = userDoc;
		return bcrypt.compare(password, userDoc.password);
	})
	.then(isEqual => {
		if(!isEqual) {
			return errorHandler("wrong password", 401);
		}

		const token = jwt
						.sign({
							email: email,
							userId: loadedUser._id
						},
						'mysupersecretsecret',
						{ 
							expiresIn: '1h' 
						});
		res.status(200).json({ token: token, userId: loadedUser._id });
	})
	.catch(err => {
		next(err);
	})
}