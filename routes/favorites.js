const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Favorite } = require('../models/favorite');
const mongoose = require('mongoose');
const express = require('express');
const { Movie } = require('../models/movie');
const router = express.Router();

router.post('/', auth, async (req, res) => {
	const movieId = req.body.id;
	if (!mongoose.Types.ObjectId.isValid(movieId))
		return res.status(400).send('Invalid ID');

	if (!(await Movie.findById(movieId)))
		return res.status(400).send('Movie with given ID does not exist');

	const userId = req.user._id;
	const updateResult = await Favorite.updateOne(
		{ userId },
		{ $addToSet: { moviesIds: movieId } }
	);
	const isAlreadyInFavorites = updateResult.nModified === 0;

	res.status(200).send(
		isAlreadyInFavorites ? 'Already in favorites' : 'Added to favorites'
	);
});

router.delete('/:id', auth, async (req, res) => {
	const movieId = req.params.id;
	if (!mongoose.Types.ObjectId.isValid(movieId))
		return res.status(404).send('Invalid ID');

	if (!(await Movie.findById(movieId)))
		return res.status(404).send('Movie with given ID does not exist');

	const userId = req.user._id;

	const updateResult = await Favorite.updateOne(
		{ userId },
		{ $pull: { moviesIds: movieId } }
	);
	const movieNotInFavorites = updateResult.nModified === 0;

	res.status(200).send(
		movieNotInFavorites
			? 'Movie not in favorites'
			: 'Removed from favorites'
	);
});

module.exports = router;
