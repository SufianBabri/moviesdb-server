const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Types.ObjectId,
		unique: true,
		required: true,
	},
	moviesIds: {
		type: [mongoose.Types.ObjectId],
		required: true,
	},
});
const Favorite = mongoose.model('Favorite', favoriteSchema);

exports.Favorite = Favorite;
exports.favoriteSchema = favoriteSchema;
