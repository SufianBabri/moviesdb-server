module.exports = function () {
	if (!process.env.VIDLY_JWT_PRIVATE_KEY) {
		throw new Error('FATAL ERROR: VIDLY_JWT_PRIVATE_KEY not defined.');
	}
};
