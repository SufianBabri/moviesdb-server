const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Genre, validate } = require('../models/genre');
const debug = require('debug')('vidly:verbose');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const genres = await Genre.find().select('name').sort('name');
    debug('Genres', genres);
    res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findOne({ _id: req.params.id }).select('name');
    debug('Genre', genre);
    if (!genre) return res.status(404).send('Genre doesn\'t exist');
    res.send(genre);
});

router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send('Genre name must be min 3 characters long.');

    let genre = new Genre({
        name: req.body.name
    });

    genre = await genre.save();
    debug('Result', genre);

    res.send(genre);
});

router.put('/:id', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send('Genre name must be min 3 characters long.');
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');

    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

    if (!genre) return res.status(404).send('Genre doesn\'t exist');

    debug('Genre', genre);
    res.send(genre);
});

router.delete('/:id', [auth, admin], async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');

    const genre = await Genre.findByIdAndRemove(req.params.id);

    if (!genre) return res.status(404).send('Genre doesn\'t exist');

    debug(genre);
    res.send(genre);
});

module.exports = router;