const express = require('express');
const dotEnvFlow = require('dotenv-flow');

dotEnvFlow.config();
const app = express();

const logger = require('./startup/logging').init(app);
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/prod')(app);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => logger.info(`Listening to port ${port}`));

module.exports = server;
