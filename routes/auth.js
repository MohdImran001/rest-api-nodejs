const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');


const router = express.Router();

router.put('/signup', [
	body('email')
	.isEmail()
	.withMessage('Please enter a valid email')
	.custom((value, { req }) => {

		return User.findOne(value).then(userDoc => {
			if(userDoc) {
				return Promise.reject('Email already exists');
			}
		})

	})
	.normalize(),

	body('password')
	.trim()
	.isLength({ min: 5 }),

	body('name')
	.trim()
	.not()
	.isEmpty()
]);



module.exports = routes;