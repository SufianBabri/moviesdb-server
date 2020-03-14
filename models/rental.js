const Joi = require('joi');
const moment = require('moment');
const mongoose = require('mongoose');

const minimalMovieSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 255,
	},
	dailyRentalRate: {
		type: Number,
		required: true,
		min: 0,
		max: 255
	}
});

const minimalCustomerSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 255,
	},
	isGold: {
		type: Boolean,
		default: false
	},
	phone: {
		type: String,
		required: true,
		min: 0,
		max: 50
	}
});
const rentalSchema = new mongoose.Schema({
	movie: {
		type: minimalMovieSchema,
		require: true
	},
	customer: {
		type: minimalCustomerSchema,
		require: true
	},
	dateOut: {
		type: Number,
		required: true,
		default: Date.now,
	},
	dateReturned: {
		type: Number,
	},
	rentalFee: {
		type: Number,
		min: 0
	},
});

rentalSchema.statics.lookup = function (customerId, movieId) {
	return this.findOne({
		'customer._id': customerId,
		'movie._id': movieId
	});
}

rentalSchema.methods.return = function() {
	this.dateReturned = Date.now();
	
	const rentalDays = moment().diff(this.dateOut, 'days');
	this.rentalFee = rentalDays * this.movie.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
	return Joi.validate(rental, {
		movieId: Joi.objectId().required(),
		customerId: Joi.objectId().required(),
	});
}

exports.Rental = Rental;
exports.validate = validateRental;
exports.rentalSchema = rentalSchema;