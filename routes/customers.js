const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');
const debug = require('debug')('vidly:verbose');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
	const customers = await Customer.find().select().sort('name');
	debug('Customers', customers);
	res.send(customers);
});

router.get('/:id', async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');
	const customer = await Customer.findOne({ _id: req.params.id }).select('name');
	debug('Customer', customer);
	if (!customer) return res.status(404).send('Customer doesn\'t exist');
	res.send(customer);
});

router.post('/', auth, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error);

	let customer = new Customer({
		name: req.body.name,
		phone: req.body.phone,
		isGold: req.body.isGold
	});

	customer = await customer.save();
	debug('Result', customer);

	res.send(customer);
});

router.put('/:id', auth, async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error);
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');

	const customer = await Customer.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });

	if (!customer) return res.status(404).send('Customer doesn\'t exist');

	debug('Customer', customer);
	res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).send('Invalid ID');

	const customer = await Customer.findByIdAndRemove(req.params.id);

	if (!customer) return res.status(404).send('Customer doesn\'t exist');

	debug(customer);
	res.send(customer);
});

module.exports = router;