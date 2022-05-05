const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optional-auth');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');
const debug = require('debug')('vidly:verbose');
const mongoose = require('mongoose');
const express = require('express');
const { Favorite } = require('../models/favorite');
const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
	let favoriteMoviesIds;
	if (!req.user) favoriteMoviesIds = [];
	else {
		const favorites = await Favorite.findOne({ userId: req.user._id });
		favoriteMoviesIds = favorites === null ? [] : favorites.moviesIds;
	}

	const movies = await Movie.find()
		.select('title genre numberInStock dailyRentalRate')
		.sort('title');
	const movieList = movies.map(
		({ _id, title, numberInStock, dailyRentalRate, genre }) => ({
			_id,
			title,
			numberInStock,
			dailyRentalRate,
			genre,
			isFavorite: favoriteMoviesIds.includes(_id),
		})
	);

	debug('Movies', movieList);
	res.send(movieList);
});

router.get('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).send('Invalid ID');
	const movie = await Movie.findOne({ _id: req.params.id }).select(
		'title genre numberInStock dailyRentalRate'
	);
	debug('Movie', movie);
	if (!movie) return res.status(404).send("Movie doesn't exist");
	res.send(movie);
});

router.post('/', auth, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error);

	const genre = await Genre.findById(req.body.genreId);
	if (!genre) return res.status(400).send('Invalid genre!');

	const movie = new Movie({
		title: req.body.title,
		genre: {
			_id: genre.id,
			name: genre.name,
		},
		numberInStock: req.body.numberInStock,
		dailyRentalRate: req.body.dailyRentalRate,
	});

	await movie.save();
	debug('Result', movie);

	res.send(movie);
});

router.put('/:id', auth, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error);

	if (!mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).send('Invalid Genre ID');

	const genre = await Genre.findById(req.body.genreId);
	if (!genre) return res.status(400).send('Invalid genre!');

	const movie = await Movie.findByIdAndUpdate(
		req.params.id,
		{
			title: req.body.title,
			genre: {
				_id: genre.id,
				name: genre.name,
			},
			numberInStock: req.body.numberInStock,
			dailyRentalRate: req.body.dailyRentalRate,
		},
		{ new: true }
	);

	if (!movie) return res.status(404).send("Movie doesn't exist");

	debug('Movie', movie);
	res.send(movie);
});

router.delete('/:id', auth, async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id))
		return res.status(400).send('Invalid ID');

	const movie = await Movie.findByIdAndRemove(req.params.id);

	if (!movie) return res.status(404).send("Movie doesn't exist");

	debug(movie);
	res.send(movie);
});

module.exports = router;
