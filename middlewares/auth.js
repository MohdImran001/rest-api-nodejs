const jwt = require('jsonwebtoken');

function errorHandler(message, statusCode) {
	const error = new Error(message);
	error.statusCode = statusCode;
	throw error;
}

module.exports = (req, res, next) => {
	const authHeader = req.get('Authorization');
	if(!authHeader) {
		return errorHandler('Not Authorized', 401);
	}
	
	const token = authHeader.split(' ')[1];
	
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, 'mysupersecretsecret');
	} catch {
		return errorHandler('failed to verify user', 401);
	}

	if(!decodedToken) {
		return errorHandler('Not Authorized', 401);
	}

	req.userId = decodedToken.userId;
	next();
}