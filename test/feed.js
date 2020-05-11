const sinon = require('sinon');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const feedController = require('../controllers/feed');


describe('Auth Controller', function () {
	let _id;
	before(function(done) {
		mongoose
		.connect()
		.then(() => {
			const user = new User({
				email: "test@test.com",
				password: "tester",
				name: "tester",
				posts: []
			});
			return user.save();
		})
		.then(user => {
			_id = user._id;
			done();
		});
	});

	it('should add a created post to the posts of user', (done) => {
			const req = { 
				userId: _id,
				file: {
					path: 'xyz'
				},
				body: {
					title: 'Test Post',
					content: 'A Test Post'
				}
			};
			const res = {
				status: function() {
					return this;
				}, 
				json: function() {
				}
			};
			feedController.createPost(req, res, () => {}).then(savedUser => {
				expect(savedUser).to.have.property('posts');
				expect(savedUser.posts).to.have.length(0);
				done();
			});
	});

	after(function(done) {
		mongoose
		.disconnect()
		.then(() => {
			done();
		});
	});

});