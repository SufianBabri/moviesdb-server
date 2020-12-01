const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotEnvFlow = require('dotenv-flow');
const { User } = require('../../../models/user');

dotEnvFlow.config();

describe('user.generateAuthToken', () => {
	it('should generate a valid JWT', () => {
		const payload = {
			_id: new mongoose.Types.ObjectId().toHexString(),
			isAdmin: true,
		};
		const user = new User(payload);
		const token = user.generateAuthToken();
		const decoded = jwt.verify(token, process.env.VIDLY_JWT_PRIVATE_KEY);
		expect(decoded).toMatchObject(payload);
	});
});
