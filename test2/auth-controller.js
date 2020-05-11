const sinon = require('sinon');
const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const authController = require('../controllers/auth');

describe('Auth Controller', function () {
	let _id;
	before(function(done) {
		mongoose
		.connect('mongodb+srv://mohdimran:pE5qkgtDGsxZPli1@cluster0-gudn3.mongodb.net/test-messages?retryWrites=true&w=majority')
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

	it('should throw a 500 error if accessing database fails', (done) => {
		sinon.stub(User, 'findOne');
		User.findOne.throws();

		const req = {
			body: {
				email: 'test@test.com',
				password: 'tester'
			}
		};
		authController.login(req, {}, ()=>{}).then(result => {
			expect(result).to.be.an('error');
			expect(result).to.have.property('statusCode', 500);
			done();
		})

		User.findOne.restore();
	})

	it('should send a response with valid user status of an existing user in database', (done) => {
			const req = { userId: _id };
			const res = {
				statusCode: 500,
				userStatus: null,
				status: function(code) {
					this.statusCode = code;
					return this;
				}, 
				json: function(data) {
					this.userStatus = data.status
				}
			};

			authController.getUserStatus(req, res, () => {}).then(() => {
				expect(res.statusCode).to.be.equal(200);
				expect(res.userStatus).to.be.equal("I am new!");
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