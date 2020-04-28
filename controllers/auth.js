const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

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


	console.log(email, password, name);
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