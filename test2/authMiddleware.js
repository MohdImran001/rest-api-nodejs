const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/auth');


describe('Auth Middleware', function () {

	it('should throw an error if no authorization header is present', () => {
		const req = {
			get: () => {
				return null;
			}
		};

		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not Authorized');
	});

	it('should throw an error if authorization header has only one string', () => {
		const req = {
			get: (headerName) => {
				return 'xyz';
			}
		};

		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should throw an error if token is not verified', () => {
		const req = {
			get: (headerName) => {
				return 'Bearer xyz';
			}
		};

		expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
	});

	it('should yield userId if token is verified', () => {
		const req = {
			get: (headerName) => {
				return 'Bearer xyljbKLFNQGKLLKNGKLLAGz';
			}
		};
		sinon.stub(jwt, 'verify');
		jwt.verify.returns({ 'userId': 'abc' });
		authMiddleware(req, {}, () => {});
		jwt.verify.restore();
		expect(req).to.have.property('userId');
	});

});
