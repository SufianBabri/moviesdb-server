const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
	const token = req.header('x-auth-token');
	if (!token) return next();

	try {
		const decoded = jwt.verify(token, process.env.VIDLY_JWT_PRIVATE_KEY);
		req.user = decoded;
		next();
	} catch (e) {
		res.status(400).send('Invalid token.');
	}
};
