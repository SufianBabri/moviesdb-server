const Joi = require('joi');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();
const { Movie } = require('../models/movie');
const { Rental } = require('../models/rental');
const auth = require('../middleware/auth');

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
	const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

	if (!rental) return res.status(404).send('no rental found for provided customerId and movieId');

	if (rental.dateReturned) return res.status(400).send('rental already processed');

	rental.return();

	await rental.save();

	await Movie.update({ _id: rental.movie._id }, {
		$inc: { numberInStock: 1 }
	});
	res.send(rental);
});

function validateReturn(req) {
	const schema = {
		customerId: Joi.objectId().required(),
		movieId: Joi.objectId().required()
	}
	return Joi.validate(req, schema);
}

module.exports = router;