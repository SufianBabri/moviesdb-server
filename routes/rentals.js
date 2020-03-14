const auth = require('../middleware/auth');
const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const debug = require('debug')('vidly:verbose');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const Transaction = require("mongoose-transactions");
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', async (req, res) => {
	const rentals = await Rental.find().select('movie customer dateOut dateReturned rentalFee').sort('-dateOut');
	debug('Rentals', rentals);
	res.send(rentals);
});

router.post('/', auth, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error);

	const movie = await Movie.findById(req.body.movieId);
	if (!movie) return res.status(400).send('Invalid movie!');

	const customer = await Customer.findById(req.body.customerId);
	if (!customer) return res.status(400).send('Invalid customer!');

	if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock');

	debug('Customer', customer);
	let rental = new Rental({
		movie: {
			_id: movie._id,
			title: movie.title,
			dailyRentalRate: movie.dailyRentalRate
		},
		customer: {
			_id: customer._id,
			name: customer.name,
			isGold: customer.isGold,
			phone: customer.phone
		},
		dateOut: Date.now()
	});

	// rental = await rental.save();

	// movie.numberInStock--;
	// movie.save();
	// debug('Result', rental);

	// DB transaction or two-phase-commit in MongoDB terms.
	try {
		new Fawn.Task()
			.save('rentals', rental)
			.update('movies', { _id: '5e50d7abe05ffb06c47a5194' }, {
				$inc: { numberInStock: -1 }
			})
			.run();

		res.send(rental);
	} catch (e) {
		res.status(500).send('Something failed.');
	}

	// const transaction = new Transaction();
	// transaction.insert('Rental', rental);
	// transaction.update('Movie', { _id: '5e50d7abe05ffb06c47a5194' }, {
	// 	$inc: { numberInStock: -1 }
	// });
	// try {
	// 	const result = await transaction.run();
	// 	debug('Result', result);
	// 	res.send(rental);
	// } catch (e) {
	// 	debug(e);
	// 	await transaction.rollback();
	// 	res.status(500).send('something went wrong');
	// }
});

module.exports = router;