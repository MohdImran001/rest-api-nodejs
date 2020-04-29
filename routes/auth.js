const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authCtrl = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [
	body('email')
	.isEmail()
	.withMessage('Please enter a valid email')
	.custom((value, { req }) => {

		return User.findOne({email: value}).then(userDoc => {
			if(userDoc) {
				return Promise.reject('Email already exists');
			}
		})

	}),

	body('password')
	.trim()
	.isLength({ min: 5 }),

	body('name')
	.trim()
	.not()
	.isEmpty()
], authCtrl.signup);

router.post('/login', authCtrl.login);

module.exports = router;