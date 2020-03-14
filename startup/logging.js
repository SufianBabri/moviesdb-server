const fs = require('fs')
const logger = require('tracer').console({
	transport: function (data) {
		console.log(data.output);
		fs.appendFile('logs/logfile.log', data.rawoutput + '\n', err => {
			if (err) throw err;
		});
	}
});
const uncaughtExceptionsLogger = require('tracer').console({
	transport: function (data) {
		console.log(data.output);
		fs.appendFile('logs/uncaughtExceptions.log', data.rawoutput + '\n', err => {
			if (err) throw err;
		});
	}
});
require('express-async-errors');
const morgan = require('morgan');

process.on('unhandledRejection', (e) => {
	console.log('we got an unhandled exception');
	logger.error({ message: e.message, meta: e });
	process.exit(1);
});

process.on('uncaughtException', (e) => {
    console.log('we got an uncaught exception');
    uncaughtExceptionsLogger.error(e);
    process.exit(1);
});

function init(app) {
	if (app.get('env') === 'development') {
		app.use(morgan('tiny'));
		logger.debug('Morgan enabled...');
	}
	return logger;
}

exports.init = init;
exports.logger = logger;