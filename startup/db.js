const mongoose = require('mongoose');
const logger = require('../startup/logging').logger;

module.exports = function () {
	const db = process.env.VIDLY_DB;
	mongoose
		.connect(db, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		})
		.then(() => logger.info('Connected to DB...'))
		.catch((e) => logger.error('Failed to connect to DB', e));
};
